import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ColunistaAfiliadosView } from "@/components/painel/afiliados/colunista-afiliados-view";

export default async function ColunistaAfiliadosPage() {
  const profile = await requireRole(["colunista", "admin"]);
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // 1. Garantir que o colunista tenha um código de afiliado único
  let codigoAfiliado = profile.codigo_afiliado;
  if (!codigoAfiliado) {
    codigoAfiliado = profile.slug || profile.nome.toLowerCase().replace(/\s+/g, "-") + "-" + profile.id.slice(0, 4);
    await supabase
      .from("profiles")
      .update({ codigo_afiliado: codigoAfiliado })
      .eq("id", profile.id);
  }

  const linkAfiliado = `${siteUrl}/cadastro?ref=${codigoAfiliado}`;

  // 2. Buscar configurações
  const { data: configs } = await supabase
    .from("configuracoes")
    .select("chave, valor")
    .in("chave", ["afiliados_saque_minimo", "afiliados_comissao_percentual", "colunista_mensalidade_valor"]);

  const configMap: Record<string, string> = {};
  for (const c of configs || []) {
    configMap[c.chave] = c.valor;
  }

  const saqueMinimo = Number(configMap["afiliados_saque_minimo"] || "50.00");
  const comissaoPercentual = Number(configMap["afiliados_comissao_percentual"] || "20.00");
  const mensalidadePadrao = Number(configMap["colunista_mensalidade_valor"] || "97.00");

  // 3. Buscar indicados diretos deste colunista
  const { data: indicadosRaw } = await supabase
    .from("profiles")
    .select(`
      id,
      nome,
      slug,
      foto_url,
      created_at,
      status,
      colunas(id, nome, slug, cidade:cidades(nome, uf)),
      assinaturas_colunistas(id, status, valor_mensal, proximo_vencimento, ultimo_pagamento)
    `)
    .eq("indicado_por_id", profile.id)
    .order("created_at", { ascending: false });

  let mrrEstimado = 0;
  let indicadosAtivosCount = 0;

  const indicados = (indicadosRaw || []).map((ind) => {
    const assinatura = Array.isArray(ind.assinaturas_colunistas)
      ? ind.assinaturas_colunistas[0]
      : ind.assinaturas_colunistas;

    const coluna = Array.isArray(ind.colunas) ? ind.colunas[0] : ind.colunas;
    const cidade = coluna?.cidade ? (Array.isArray(coluna.cidade) ? coluna.cidade[0] : coluna.cidade) : null;

    const isAtivo = assinatura?.status === "ativa" || (ind.status === "ativo" && !assinatura);
    const valorMensal = Number(assinatura?.valor_mensal || mensalidadePadrao);
    const comissaoMensal = (valorMensal * comissaoPercentual) / 100;

    if (isAtivo) {
      mrrEstimado += comissaoMensal;
      indicadosAtivosCount += 1;
    }

    return {
      id: ind.id,
      nome: ind.nome,
      slug: ind.slug,
      foto_url: ind.foto_url,
      data_cadastro: ind.created_at,
      status_conta: ind.status,
      status_assinatura: assinatura?.status || (ind.status === "ativo" ? "ativa" : "pendente"),
      coluna_nome: coluna?.nome || null,
      cidade_nome: cidade ? `${cidade.nome} - ${cidade.uf}` : null,
      valor_mensal: valorMensal,
      comissao_gerada_mensal: comissaoMensal,
    };
  });

  // 4. Buscar histórico de comissões
  const { data: comissoesRaw } = await supabase
    .from("comissoes_afiliados")
    .select(`
      id,
      mes_referencia,
      valor_mensalidade,
      percentual_comissao,
      valor_comissao,
      status,
      created_at,
      indicado:profiles!indicado_id(id, nome, slug)
    `)
    .eq("afiliado_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const comissoes = (comissoesRaw || []).map((c) => {
    const indicadoData = Array.isArray(c.indicado) ? c.indicado[0] : c.indicado;
    return {
      id: c.id,
      mes_referencia: c.mes_referencia,
      valor_mensalidade: Number(c.valor_mensalidade),
      percentual_comissao: Number(c.percentual_comissao),
      valor_comissao: Number(c.valor_comissao),
      status: c.status,
      data: c.created_at,
      indicado_nome: indicadoData?.nome || "Colunista Indicado",
    };
  });

  // 5. Buscar histórico de saques
  const { data: saquesRaw } = await supabase
    .from("saques_afiliados")
    .select("*")
    .eq("colunista_id", profile.id)
    .order("solicitado_em", { ascending: false });

  let totalResgatado = 0;
  const saques = (saquesRaw || []).map((s) => {
    const v = Number(s.valor);
    if (s.status === "pago") {
      totalResgatado += v;
    }
    return {
      id: s.id,
      valor: v,
      chave_pix: s.chave_pix,
      tipo_chave_pix: s.tipo_chave_pix,
      status: s.status as "pendente" | "pago" | "rejeitado",
      comprovante: s.comprovante,
      motivo_rejeicao: s.motivo_rejeicao,
      solicitado_em: s.solicitado_em,
      pago_em: s.pago_em,
    };
  });

  const saldoDisponivel = Number(profile.saldo_afiliado || 0);
  const totalComissoesHistorico = comissoes.reduce((acc, c) => acc + c.valor_comissao, 0);

  return (
    <ColunistaAfiliadosView
      initialData={{
        codigo_afiliado: codigoAfiliado,
        link_afiliado: linkAfiliado,
        saldo_disponivel: saldoDisponivel,
        total_resgatado: totalResgatado,
        total_ganho: totalComissoesHistorico || saldoDisponivel + totalResgatado,
        mrr_estimado: mrrEstimado,
        total_indicados: indicados.length,
        indicados_ativos: indicadosAtivosCount,
        comissao_percentual: comissaoPercentual,
        saque_minimo: saqueMinimo,
        chave_pix_salva: profile.chave_pix || null,
        tipo_chave_pix_salva: profile.tipo_chave_pix || null,
        indicados,
        comissoes,
        saques,
      }}
    />
  );
}
