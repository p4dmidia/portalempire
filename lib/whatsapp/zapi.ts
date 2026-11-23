/**
 * Módulo de Integração com Z-API (Disparo de Mensagens WhatsApp)
 * Documentação Oficial: https://developer.z-api.io/
 */

export interface MensagemWhatsAppOptions {
  telefone: string;
  mensagem: string;
}

export interface EnviarMensagemZApiResult {
  sucesso: boolean;
  mensagemId?: string;
  erro?: string;
  mock?: boolean;
}

export async function enviarMensagemZApi({
  telefone,
  mensagem,
}: MensagemWhatsAppOptions): Promise<EnviarMensagemZApiResult> {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  // 1. Sanitizar telefone: apenas números com DDI do Brasil (55) se não tiver
  let phone = telefone.replace(/\D/g, "");
  if (!phone.startsWith("55") && (phone.length === 10 || phone.length === 11)) {
    phone = `55${phone}`;
  }

  // 2. Se as credenciais ainda não estiverem preenchidas no ambiente
  if (!instanceId || !token || instanceId.includes("dummy") || token.includes("dummy")) {
    console.warn(`[Z-API Não Configurada] Falta ZAPI_INSTANCE_ID ou ZAPI_TOKEN no ambiente para enviar para ${phone}.`);
    console.log(`[Mensagem pronta para envio]:\n${mensagem}`);
    return {
      sucesso: false,
      mock: true,
      erro: "As variáveis de ambiente da Z-API (ZAPI_INSTANCE_ID e ZAPI_TOKEN) não estão configuradas na Vercel ou no .env.local.",
      mensagemId: `mock_zapi_${Date.now()}`,
    };
  }

  try {
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (clientToken && !clientToken.includes("dummy")) {
      headers["Client-Token"] = clientToken;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        phone,
        message: mensagem,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Z-API] Erro ao enviar mensagem:", data);
      return {
        sucesso: false,
        erro: data.message || `Erro HTTP ${response.status}`,
      };
    }

    console.log(`[Z-API] Mensagem enviada com sucesso para ${phone}:`, data.zaapId || data.id);
    return {
      sucesso: true,
      mensagemId: data.zaapId || data.id,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Z-API] Falha de conexão:", msg);
    return {
      sucesso: false,
      erro: msg,
    };
  }
}

