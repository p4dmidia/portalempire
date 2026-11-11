import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enviarMensagemZApi } from "@/lib/whatsapp/zapi";

const MP_SUBSCRIPTION_PLAN_ID = "d146163a053d46d2ac22128a84f4bb80";
const MP_CHECKOUT_TRIAL_URL = "https://mpago.la/2HBfYLs";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: colunaId } = await props.params;
    const body = await request.json();
    const { nome, whatsapp, email, colunaNome, autorNome } = body;

    if (!nome || !whatsapp) {
      return NextResponse.json(
        { error: "Nome e WhatsApp são obrigatórios." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Gravar na tabela colunistas_seguidores se existir
    const { error: seguidorError } = await supabase
      .from("colunistas_seguidores")
      .insert({
        coluna_id: colunaId,
        nome,
        whatsapp,
        email: email || null,
        plano_trial: true,
        status: "ativo",
      });

    // 2. Se a tabela ainda não tiver sido criada no Supabase, registra na auditoria
    if (seguidorError) {
      await supabase.from("auditoria").insert({
        usuario_id: null,
        acao: "favoritar_colunista_trial_90d",
        entidade: "colunas",
        entidade_id: colunaId,
        dados: {
          nome,
          whatsapp,
          email,
          coluna_id: colunaId,
          coluna_nome: colunaNome,
          autor_nome: autorNome,
          trial_dias: 90,
          valor_recorrente: 9.9,
          data: new Date().toISOString(),
        },
      });
    }

    // 3. Disparo de Boas-Vindas no WhatsApp via Z-API
    const mensagemBoasVindas = `👋 Olá, ${nome}!\n\nVocê favoritou com sucesso a coluna *${colunaNome}* de *${autorNome || "nossa redação"}* no Portal Empire Cidades! ⭐\n\n🎁 *Seus 90 dias de teste gratuito estão ativados!*\nPara autorizar seu cartão com segurança sem cobrança hoje (R$ 0,00) e garantir o recebimento das novidades exclusivas, acesse o link oficial do Mercado Pago:\n👉 ${MP_CHECKOUT_TRIAL_URL}\n\n📰 Acesse o portal: https://portalempire.com.br/colunas`;

    try {
      await enviarMensagemZApi({
        telefone: whatsapp,
        mensagem: mensagemBoasVindas,
      });
    } catch (errZApi) {
      console.warn("[Z-API] Aviso ao disparar mensagem de boas-vindas:", errZApi);
    }

    return NextResponse.json({
      success: true,
      message: "Você agora é um seguidor VIP desta coluna com 90 dias de teste grátis!",
      checkoutUrl: MP_CHECKOUT_TRIAL_URL,
    });
  } catch (error: unknown) {
    const mensagem =
      error instanceof Error ? error.message : "Erro ao favoritar coluna.";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

