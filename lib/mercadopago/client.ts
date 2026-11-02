/**
 * Cliente para API do Mercado Pago (Checkout Transparente PIX + Checkout Pro)
 */

const DEFAULT_MP_PUBLIC_KEY = "APP_USR-469c2efa-60b9-4b85-bdfb-2dc05bb9d803";
const DEFAULT_MP_ACCESS_TOKEN =
  "APP_USR-6055683406329622-091412-8b91e9d0e080ac3a6473d37d7450bb94-157823242";

export function getMercadoPagoPublicKey(): string {
  return process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || DEFAULT_MP_PUBLIC_KEY;
}

export function getMercadoPagoAccessToken(): string {
  return process.env.MERCADO_PAGO_ACCESS_TOKEN || DEFAULT_MP_ACCESS_TOKEN;
}

export interface MercadoPagoPaymentResponse {
  id: number | string;
  status:
    | "pending"
    | "approved"
    | "authorized"
    | "in_process"
    | "in_mediation"
    | "rejected"
    | "cancelled"
    | "refunded"
    | "charged_back";
  status_detail: string;
  transaction_amount: number;
  external_reference?: string;
  date_approved?: string;
  payment_method_id?: string;
  payment_type_id?: string;
  metadata?: Record<string, unknown>;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
}

export interface DadosCriarPreferenciaMP {
  titulo: string;
  preco: number;
  colunistaId: string;
  email: string;
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  returnPath?: string;
  metadata?: Record<string, unknown>;
}

export interface DadosCriarPixMP {
  titulo: string;
  preco: number;
  colunistaId: string;
  email: string;
  nome: string;
  cpfCnpj?: string;
  metadata?: Record<string, unknown>;
}

export interface RespostaPreferenciaMP {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export async function mercadoPagoFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getMercadoPagoAccessToken();

  // Se não houver token configurado, retorna simulação (mock)
  if (!token || token.includes("dummy")) {
    return mockMercadoPago(endpoint, options) as T;
  }

  const url = `https://api.mercadopago.com${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const mpError = data as {
      message?: string;
      cause?: Array<{ description?: string; code?: string | number }>;
    };
    const causeDesc = mpError?.cause?.[0]?.description;
    const errorMsg =
      causeDesc || mpError?.message || `Erro Mercado Pago (${res.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

/**
 * Cria pagamento PIX transparente imediato via API /v1/payments do Mercado Pago
 */
export async function criarPagamentoPixMP(
  dados: DadosCriarPixMP
): Promise<MercadoPagoPaymentResponse> {
  const partesNome = dados.nome.trim().split(/\s+/);
  const firstName = partesNome[0] || "Colunista";
  const lastName = partesNome.slice(1).join(" ") || "Empire";

  const docClean = (dados.cpfCnpj || "").replace(/\D/g, "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isHttps = siteUrl.startsWith("https://");

  const payerObj: Record<string, unknown> = {
    email: dados.email.trim().toLowerCase(),
    first_name: firstName,
    last_name: lastName,
  };

  if (docClean.length === 11 || docClean.length === 14) {
    payerObj.identification = {
      type: docClean.length === 14 ? "CNPJ" : "CPF",
      number: docClean,
    };
  }

  const payload: Record<string, unknown> = {
    transaction_amount: Number(dados.preco.toFixed(2)),
    description: dados.titulo,
    payment_method_id: "pix",
    external_reference: dados.colunistaId,
    payer: payerObj,
    metadata: {
      colunista_id: dados.colunistaId,
      email: dados.email,
      nome: dados.nome,
      ...(dados.metadata || {}),
    },
  };

  if (isHttps) {
    payload.notification_url = `${siteUrl}/api/webhooks/mercadopago`;
  }

  const idempotencyKey = `pix-${dados.colunistaId}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  return mercadoPagoFetch<MercadoPagoPaymentResponse>("/v1/payments", {
    method: "POST",
    headers: {
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Cria preferência Checkout Pro (Cartão, PIX, Saldo MP, Boleto)
 */
export async function criarPreferenciaMensalidadeMP(
  dados: DadosCriarPreferenciaMP
): Promise<RespostaPreferenciaMP> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const isHttps = siteUrl.startsWith("https://");
  const baseReturn =
    dados.returnPath || "/painel/colunista/dashboard";
  const sep = baseReturn.includes("?") ? "&" : "?";

  const partesNome = dados.nome.trim().split(/\s+/);
  const firstName = partesNome[0] || "Colunista";
  const lastName = partesNome.slice(1).join(" ") || "Empire";
  const docClean = (dados.cpfCnpj || "").replace(/\D/g, "");

  const payerObj: Record<string, unknown> = {
    name: firstName,
    surname: lastName,
    email: dados.email.trim().toLowerCase(),
  };

  if (docClean.length === 11 || docClean.length === 14) {
    payerObj.identification = {
      type: docClean.length === 14 ? "CNPJ" : "CPF",
      number: docClean,
    };
  }

  const payload: Record<string, unknown> = {
    items: [
      {
        id: "licenca-colunista-empire",
        title: dados.titulo,
        description:
          "Licença mensal de Colunista Oficial Empire Cidades (Cobertura Regional + Publicidade + Indicação Premiada)",
        quantity: 1,
        unit_price: Number(dados.preco.toFixed(2)),
        currency_id: "BRL",
      },
    ],
    payer: payerObj,
    external_reference: dados.colunistaId,
    back_urls: {
      success: `${siteUrl}${baseReturn}${sep}pagamento=sucesso&colunista_id=${encodeURIComponent(
        dados.colunistaId
      )}`,
      failure: `${siteUrl}${baseReturn}${sep}pagamento=falha&colunista_id=${encodeURIComponent(
        dados.colunistaId
      )}`,
      pending: `${siteUrl}${baseReturn}${sep}pagamento=pendente&colunista_id=${encodeURIComponent(
        dados.colunistaId
      )}`,
    },
    metadata: {
      colunista_id: dados.colunistaId,
      email: dados.email,
      nome: dados.nome,
      ...(dados.metadata || {}),
    },
  };

  if (isHttps) {
    payload.auto_return = "approved";
    payload.notification_url = `${siteUrl}/api/webhooks/mercadopago`;
  }

  return mercadoPagoFetch<RespostaPreferenciaMP>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function obterPagamentoMP(
  paymentId: string | number
): Promise<MercadoPagoPaymentResponse> {
  return mercadoPagoFetch<MercadoPagoPaymentResponse>(`/v1/payments/${paymentId}`);
}

function mockMercadoPago(endpoint: string, options: RequestInit): unknown {
  const method = options.method?.toUpperCase() || "GET";

  if (endpoint.includes("/checkout/preferences") && method === "POST") {
    const id = `pref_${Math.random().toString(36).substring(2, 10)}`;
    return {
      id,
      init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${id}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=${id}`,
    };
  }

  if (endpoint.includes("/v1/payments") && method === "POST") {
    return {
      id: Math.floor(100000000 + Math.random() * 900000000),
      status: "pending",
      status_detail: "pending_waiting_transfer",
      transaction_amount: 250.0,
      payment_method_id: "pix",
      payment_type_id: "bank_transfer",
      point_of_interaction: {
        transaction_data: {
          qr_code:
            "00020126580014br.gov.bcb.pix0136469c2efa-60b9-4b85-bdfb-2dc05bb9d8035204000053039865406250.005802BR5914EMPIRE CIDADES6009SAO PAULO62070503***6304ABCD",
          qr_code_base64: "",
          ticket_url: "https://www.mercadopago.com.br",
        },
      },
    };
  }

  if (endpoint.includes("/v1/payments")) {
    return {
      id: 123456789,
      status: "approved",
      status_detail: "accredited",
      transaction_amount: 250.0,
      external_reference: "colunista_mock",
      date_approved: new Date().toISOString(),
    };
  }

  return { success: true };
}
