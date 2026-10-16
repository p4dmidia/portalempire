/**
 * Cliente para API do Mercado Pago (com suporte a Mock transparente em desenvolvimento)
 */

export function getMercadoPagoAccessToken(): string {
  return process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
}

export interface MercadoPagoPaymentResponse {
  id: number | string;
  status: "pending" | "approved" | "authorized" | "in_process" | "in_mediation" | "rejected" | "cancelled" | "refunded" | "charged_back";
  status_detail: string;
  transaction_amount: number;
  external_reference?: string;
  date_approved?: string;
  payment_method_id?: string;
  payment_type_id?: string;
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

  // Se não houver token configurado em desenvolvimento, retorna simulação (mock)
  if (!token || token.includes("dummy") || token.includes("TEST-")) {
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
    const errorMsg = (data as { message?: string })?.message || `Erro Mercado Pago (${res.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function criarPreferenciaMensalidadeMP(
  dados: DadosCriarPreferenciaMP
): Promise<RespostaPreferenciaMP> {
  const payload = {
    items: [
      {
        id: "mensalidade-coluna",
        title: dados.titulo,
        quantity: 1,
        unit_price: Number(dados.preco.toFixed(2)),
        currency_id: "BRL",
      },
    ],
    payer: {
      name: dados.nome,
      email: dados.email,
    },
    external_reference: dados.colunistaId,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/painel/colunista/dashboard?pagamento=sucesso`,
      failure: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/painel/colunista/dashboard?pagamento=falha`,
      pending: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/painel/colunista/dashboard?pagamento=pendente`,
    },
    auto_return: "approved",
  };

  return mercadoPagoFetch<RespostaPreferenciaMP>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function obterPagamentoMP(paymentId: string | number): Promise<MercadoPagoPaymentResponse> {
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

  if (endpoint.includes("/v1/payments")) {
    return {
      id: 123456789,
      status: "approved",
      status_detail: "accredited",
      transaction_amount: 97.0,
      external_reference: "colunista_mock",
      date_approved: new Date().toISOString(),
    };
  }

  return { success: true };
}
