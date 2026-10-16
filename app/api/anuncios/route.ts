import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { criarCobrancaComSplit, RespostaCobrancaAsaas } from "@/lib/asaas/cobrancas";
import { enviarEmailCobrancaAnuncio } from "@/lib/email/servico";

const AnuncioSchema = z.object({
  espaco_id: z.string().uuid("Espaço de anúncio é obrigatório"),
  anunciante_id: z.string().uuid("Anunciante é obrigatório"),
  titulo: z.string().min(3, "Título do anúncio deve ter pelo menos 3 caracteres"),
  imagem_desktop_url: z.string().url("URL da imagem desktop é obrigatória"),
  imagem_mobile_url: z.string().url().nullable().optional().or(z.literal("")),
  link_destino: z.string().url("Link de destino inválido"),
  inicio_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de início inválida (AAAA-MM-DD)"),
  fim_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de fim inválida (AAAA-MM-DD)"),
  status: z.enum(["aguardando_pagamento", "ativo", "agendado", "pausado", "expirado", "cancelado"]).default("ativo"),
  valor: z.number().min(0, "Valor do anúncio não pode ser negativo").default(0),
  forma_pagamento: z.enum(["pix", "boleto", "cartao", "manual", "dinheiro"]).default("pix"),
  gerar_cobranca_asaas: z.boolean().default(false),
});

interface AnuncioQueryRow {
  id: string;
  titulo: string;
  valor: number;
  impressoes: number;
  cliques: number;
  anunciante?: {
    id: string;
    nome: string;
    email?: string | null;
    telefone?: string | null;
    cpf_cnpj?: string | null;
  } | null;
  pedidos?: Array<{
    id: string;
    valor_total: number;
    comissao_percentual: number;
    valor_comissao: number;
    valor_liquido_dono: number;
    forma_pagamento: string;
    asaas_payment_id: string | null;
    link_pagamento: string | null;
    status: string;
    pago_em: string | null;
  }>;
  [key: string]: unknown;
}

export async function GET(request: Request) {
  try {
    const profile = await requireRole(["admin", "colunista", "anunciante"]);
    const { searchParams } = new URL(request.url);
    const todos = searchParams.get("todos") === "true";
    const status = searchParams.get("status");

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("anuncios")
      .select(`
        *,
        espaco:espacos_anuncio(
          id, nome, dono_tipo, preco_mensal, preco_semanal,
          formato:formatos_anuncio(id, nome, posicao, largura, altura, largura_mobile, altura_mobile),
          coluna:colunas(id, nome, slug)
        ),
        anunciante:anunciantes(id, nome, email, telefone, cpf_cnpj),
        dono:profiles!dono_id(id, nome, email, foto_url, asaas_wallet_id),
        pedidos(
          id, valor_total, comissao_percentual, valor_comissao, valor_liquido_dono,
          forma_pagamento, asaas_payment_id, link_pagamento, status, pago_em
        )
      `)
      .order("created_at", { ascending: false });

    if (profile.role === "colunista") {
      query = query.eq("dono_id", profile.id);
    } else if (profile.role === "anunciante") {
      query = query.eq("anunciante.usuario_id", profile.id);
    } else if (profile.role === "admin" && !todos) {
      // admin pode ver todos ou filtrados
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: anuncios, error } = await query;
    if (error) throw error;

    // Normalizar campos para compatibilidade com a interface
    const formatados = ((anuncios as unknown as AnuncioQueryRow[]) || []).map((a) => ({
      ...a,
      anunciante: {
        id: a.anunciante?.id,
        nome_contato: a.anunciante?.nome,
        empresa: null,
        email: a.anunciante?.email,
        telefone: a.anunciante?.telefone,
        cpf_cnpj: a.anunciante?.cpf_cnpj,
      },
      valor_total: a.valor || 0,
      impressoes: a.impressoes || 0,
      cliques: a.cliques || 0,
      pedido: a.pedidos?.[0] || null,
    }));

    return NextResponse.json({ success: true, data: formatados, anuncios: formatados });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro ao listar anúncios.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireRole(["admin", "colunista"]);
    const body = await request.json();
    const dados = AnuncioSchema.parse(body);

    const inicio = new Date(dados.inicio_em);
    const fim = new Date(dados.fim_em);

    if (fim < inicio) {
      return NextResponse.json(
        { error: "A data de término não pode ser anterior à data de início." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Obter informações do espaço
    const { data: espaco } = await supabase
      .from("espacos_anuncio")
      .select(`
        id, dono_tipo, coluna_id,
        coluna:colunas(dono_id, dono:profiles(id, nome, email, asaas_wallet_id))
      `)
      .eq("id", dados.espaco_id)
      .single();

    if (!espaco) {
      return NextResponse.json({ error: "Espaço de anúncio não encontrado." }, { status: 404 });
    }

    let donoId = profile.id;
    let donoWalletId = profile.asaas_wallet_id || null;

    if (espaco.dono_tipo === "coluna") {
      const colunaData = Array.isArray(espaco.coluna)
        ? espaco.coluna[0]
        : (espaco.coluna as { dono_id?: string; dono?: { asaas_wallet_id?: string | null } } | null);

      const colunaDonoId = colunaData?.dono_id;

      if (!colunaDonoId) {
        return NextResponse.json({ error: "Coluna do espaço não encontrada." }, { status: 400 });
      }

      if (profile.role !== "admin" && colunaDonoId !== profile.id) {
        return NextResponse.json(
          { error: "Você só pode criar anúncios em espaços das suas próprias colunas." },
          { status: 403 }
        );
      }

      donoId = colunaDonoId;

      const donoProfile = Array.isArray(colunaData?.dono)
        ? (colunaData.dono[0] as { asaas_wallet_id?: string | null } | undefined)
        : (colunaData?.dono as { asaas_wallet_id?: string | null } | null);

      donoWalletId = donoProfile?.asaas_wallet_id || donoWalletId;
    }

    // 2. Verificar sobreposição de datas no mesmo espaço para status ativo/aguardando_pagamento
    if (["ativo", "aguardando_pagamento"].includes(dados.status)) {
      const { data: sobrepostos } = await supabase
        .from("anuncios")
        .select("id, titulo, inicio_em, fim_em, status")
        .eq("espaco_id", dados.espaco_id)
        .in("status", ["ativo", "aguardando_pagamento"])
        .lte("inicio_em", dados.fim_em)
        .gte("fim_em", dados.inicio_em);

      if (sobrepostos && sobrepostos.length > 0) {
        const conflito = sobrepostos[0];
        return NextResponse.json(
          {
            error: `Conflito de período: já existe o anúncio "${conflito.titulo}" ativo neste espaço entre ${conflito.inicio_em} e ${conflito.fim_em}.`,
          },
          { status: 409 }
        );
      }
    }

    // 3. Buscar dados do anunciante
    const { data: anunciante } = await supabase
      .from("anunciantes")
      .select("*")
      .eq("id", dados.anunciante_id)
      .single();

    if (!anunciante) {
      return NextResponse.json({ error: "Anunciante não encontrado." }, { status: 404 });
    }

    // 4. Buscar percentual de comissão padrão nas configurações
    const { data: configComissao } = await supabase
      .from("configuracoes")
      .select("valor")
      .eq("chave", "comissao_padrao_percentual")
      .single();

    const comissaoPct = Number(configComissao?.valor || 20);
    const valorTotal = dados.valor || 0;
    const valorComissao = Number(((valorTotal * comissaoPct) / 100).toFixed(2));
    const valorLiquidoDono = Number((valorTotal - valorComissao).toFixed(2));

    const isPagamentoManual = dados.forma_pagamento === "manual" || dados.forma_pagamento === "dinheiro";
    let statusAnuncio = dados.status;

    if (dados.gerar_cobranca_asaas && !isPagamentoManual) {
      statusAnuncio = "aguardando_pagamento";
    }

    // 5. Inserir anúncio
    const { data: novoAnuncio, error: insertError } = await supabase
      .from("anuncios")
      .insert({
        espaco_id: dados.espaco_id,
        anunciante_id: dados.anunciante_id,
        dono_id: donoId,
        titulo: dados.titulo,
        imagem_desktop_url: dados.imagem_desktop_url,
        imagem_mobile_url: dados.imagem_mobile_url || null,
        link_destino: dados.link_destino,
        inicio_em: dados.inicio_em,
        fim_em: dados.fim_em,
        status: statusAnuncio,
        valor: valorTotal,
      })
      .select(`
        *,
        espaco:espacos_anuncio(
          id, nome, dono_tipo,
          formato:formatos_anuncio(nome, posicao, largura, altura)
        ),
        anunciante:anunciantes(id, nome, email, telefone)
      `)
      .single();

    if (insertError) throw insertError;

    // 6. Gerar Pedido & Cobrança Asaas com Split se solicitado
    let asaasPaymentId: string | null = null;
    let linkPagamento: string | null = null;
    let pixQrCode: RespostaCobrancaAsaas["pixQrCode"] | null = null;

    if (dados.gerar_cobranca_asaas && !isPagamentoManual && valorTotal > 0) {
      try {
        const cobranca = await criarCobrancaComSplit({
          cliente: {
            name: anunciante.nome,
            cpfCnpj: anunciante.cpf_cnpj,
            email: anunciante.email,
            phone: anunciante.telefone,
            mobilePhone: anunciante.telefone,
          },
          valor: valorTotal,
          descricao: `Publicidade: ${dados.titulo} (${dados.inicio_em} a ${dados.fim_em})`,
          vencimento: dados.inicio_em,
          formaPagamento: dados.forma_pagamento === "cartao" ? "CREDIT_CARD" : dados.forma_pagamento === "boleto" ? "BOLETO" : "PIX",
          splitColunistaWalletId: espaco.dono_tipo === "coluna" ? donoWalletId : null,
          valorLiquidoColunista: espaco.dono_tipo === "coluna" ? valorLiquidoDono : null,
          externalReference: novoAnuncio.id,
        });

        asaasPaymentId = cobranca.id;
        linkPagamento = cobranca.invoiceUrl;
        pixQrCode = cobranca.pixQrCode || null;

        // Enviar e-mail de cobrança para o anunciante
        if (anunciante.email) {
          enviarEmailCobrancaAnuncio({
            email: anunciante.email,
            nomeCliente: anunciante.nome,
            tituloAnuncio: dados.titulo,
            valor: valorTotal,
            linkPagamento: cobranca.invoiceUrl,
          }).catch(console.error);
        }
      } catch (err) {
        console.error("Erro ao gerar cobrança no Asaas:", err);
      }
    }

    // 7. Criar registro na tabela pedidos
    const statusPedido = isPagamentoManual || statusAnuncio === "ativo" ? "pago" : "pendente";
    const formaPgtoPedido = isPagamentoManual ? "dinheiro" : dados.forma_pagamento === "cartao" ? "cartao" : dados.forma_pagamento === "boleto" ? "boleto" : "pix";

    const { data: pedidoCriado } = await supabase
      .from("pedidos")
      .insert({
        anuncio_id: novoAnuncio.id,
        dono_id: donoId,
        valor_total: valorTotal,
        comissao_percentual: comissaoPct,
        valor_comissao: valorComissao,
        valor_liquido_dono: valorLiquidoDono,
        forma_pagamento: formaPgtoPedido,
        asaas_payment_id: asaasPaymentId,
        link_pagamento: linkPagamento,
        status: statusPedido,
        pago_em: statusPedido === "pago" ? new Date().toISOString() : null,
      })
      .select("*")
      .single();

    // 8. Revalidar cache público se ativo
    if (statusAnuncio === "ativo") {
      try {
        revalidatePath("/");
        revalidatePath("/colunas");
      } catch {
        // Ignore cache in dev
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: novoAnuncio,
        pedido: pedidoCriado,
        link_pagamento: linkPagamento,
        pix_qr_code: pixQrCode,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Dados inválidos." }, { status: 400 });
    }
    const mensagem = error instanceof Error ? error.message : "Erro ao criar anúncio.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
