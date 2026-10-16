/**
 * Serviço de E-mails Transacionais para o Módulo de Publicidade & Anúncios
 */

export interface EmailParams {
  para: string;
  assunto: string;
  conteudoHtml: string;
}

export async function enviarEmailTransacional({
  para,
  assunto,
  conteudoHtml,
}: EmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === "dummy-resend-key" || apiKey === "your-resend-api-key") {
    console.log(`[E-mail Simulado] Para: ${para} | Assunto: ${assunto}`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Portal Empire <contato@portalempire.com.br>",
        to: [para],
        subject: assunto,
        html: conteudoHtml,
      }),
    });

    return res.ok;
  } catch (error) {
    console.error("Erro ao enviar e-mail transacional:", error);
    return false;
  }
}

/**
 * Envia fatura e link de pagamento para o anunciante
 */
export async function enviarEmailCobrancaAnuncio(dados: {
  email: string;
  nomeCliente: string;
  tituloAnuncio: string;
  valor: number;
  linkPagamento: string;
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #0f172a;">Sua Campanha no Portal Empire</h2>
      <p>Olá, <strong>${dados.nomeCliente}</strong>,</p>
      <p>A fatura para veiculação do anúncio <strong>"${dados.tituloAnuncio}"</strong> foi gerada com sucesso.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #64748b;">Valor Total:</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #10b981;">R$ ${dados.valor.toFixed(2)}</p>
      </div>
      <p>Clique no botão abaixo para efetuar o pagamento via PIX, Boleto ou Cartão de Crédito:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dados.linkPagamento}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
          Pagar Fatura Online
        </a>
      </div>
      <p style="font-size: 12px; color: #94a3b8;">Assim que o pagamento for confirmado, seu anúncio será ativado automaticamente na data combinada.</p>
    </div>
  `;

  return enviarEmailTransacional({
    para: dados.email,
    assunto: `Fatura de Publicidade: ${dados.tituloAnuncio} — Portal Empire`,
    conteudoHtml: html,
  });
}

/**
 * Envia notificação de anúncio ativado
 */
export async function enviarEmailAnuncioAtivado(dados: {
  email: string;
  nomeCliente: string;
  tituloAnuncio: string;
  inicioEm: string;
  fimEm: string;
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #10b981;">🎉 Anúncio Ativado com Sucesso!</h2>
      <p>Olá, <strong>${dados.nomeCliente}</strong>,</p>
      <p>O pagamento da sua campanha <strong>"${dados.tituloAnuncio}"</strong> foi confirmado e o anúncio já está no ar.</p>
      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
        <p style="margin: 0; font-size: 14px; color: #166534;">Período de Veiculação:</p>
        <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #15803d;">
          ${new Date(dados.inicioEm).toLocaleDateString("pt-BR")} até ${new Date(dados.fimEm).toLocaleDateString("pt-BR")}
        </p>
      </div>
      <p>Agradecemos a parceria! Você receberá relatórios periódicos com impressões e cliques do seu anúncio.</p>
    </div>
  `;

  return enviarEmailTransacional({
    para: dados.email,
    assunto: `Seu anúncio está no ar: ${dados.tituloAnuncio} — Portal Empire`,
    conteudoHtml: html,
  });
}

/**
 * Envia aviso de vencimento de campanha (3 dias antes)
 */
export async function enviarEmailAvisoVencimento(dados: {
  email: string;
  nomeCliente: string;
  tituloAnuncio: string;
  fimEm: string;
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #f59e0b;">⏳ Sua Campanha está Próxima do Vencimento</h2>
      <p>Olá, <strong>${dados.nomeCliente}</strong>,</p>
      <p>Informamos que o seu anúncio <strong>"${dados.tituloAnuncio}"</strong> encerra a veiculação em <strong>${new Date(dados.fimEm).toLocaleDateString("pt-BR")}</strong> (em 3 dias).</p>
      <p>Deseja renovar sua campanha publicitária para garantir a continuidade do seu espaço com condições especiais?</p>
      <p>Entre em contato com nossa equipe comercial ou com o colunista responsável para solicitar a renovação.</p>
    </div>
  `;

  return enviarEmailTransacional({
    para: dados.email,
    assunto: `Aviso de Término da Campanha: ${dados.tituloAnuncio} — Portal Empire`,
    conteudoHtml: html,
  });
}
