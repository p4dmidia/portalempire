/**
 * Cliente HTTP tipado para a API v3 do Asaas (Sandbox e Produção)
 */

export function getAsaasBaseUrl(): string {
  const env = process.env.ASAAS_ENV?.toLowerCase();
  if (env === "production" || env === "producao") {
    return "https://api.asaas.com/v3";
  }
  return "https://sandbox.asaas.com/api/v3";
}

export function getAsaasApiKey(): string {
  return process.env.ASAAS_API_KEY || "";
}

export interface AsaasApiError {
  code?: string;
  description?: string;
}

export interface AsaasErrorResponse {
  errors?: AsaasApiError[];
}

export async function asaasFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getAsaasBaseUrl();
  const apiKey = getAsaasApiKey();

  // Em ambiente de teste/sandbox sem chave real fornecida, permitimos mock transparente
  if (!apiKey || apiKey === "dummy-asaas-key" || apiKey === "your-asaas-api-key") {
    console.warn(`[Asaas Mock] Chave do Asaas não configurada. Simulando chamada para ${endpoint}`);
    return mockAsaasResponse(endpoint, options) as T;
  }

  const url = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    access_token: apiKey,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorData = data as AsaasErrorResponse;
    const msg =
      errorData.errors?.[0]?.description ||
      `Erro na chamada da API Asaas (${res.status} ${res.statusText})`;
    throw new Error(msg);
  }

  return data as T;
}

/**
 * Respostas simuladas (Mock) para desenvolvimento e testes no sandbox
 */
function mockAsaasResponse(endpoint: string, options: RequestInit): unknown {
  const method = options.method?.toUpperCase() || "GET";
  const body = options.body ? JSON.parse(options.body as string) : {};

  if (endpoint.includes("/accounts") && method === "POST") {
    return {
      object: "account",
      id: `cus_${Math.random().toString(36).substring(2, 10)}`,
      name: body.name || "Subconta Colunista",
      email: body.email,
      walletId: `wal_${Math.random().toString(36).substring(2, 15)}`,
      apiKey: `$aact_${Math.random().toString(36).substring(2, 20)}`,
    };
  }

  if (endpoint.includes("/customers") && method === "POST") {
    return {
      object: "customer",
      id: `cus_${Math.random().toString(36).substring(2, 10)}`,
      name: body.name,
      email: body.email,
      cpfCnpj: body.cpfCnpj,
      phone: body.phone,
    };
  }

  if (endpoint.includes("/payments") && method === "POST") {
    const paymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
    return {
      object: "payment",
      id: paymentId,
      customer: body.customer,
      value: body.value,
      netValue: body.value ? body.value * 0.97 : 0,
      description: body.description,
      billingType: body.billingType || "UNDEFINED",
      status: "PENDING",
      dueDate: body.dueDate,
      invoiceUrl: `https://sandbox.asaas.com/i/${paymentId}`,
      bankSlipUrl: `https://sandbox.asaas.com/b/pdf/${paymentId}`,
      split: body.split,
    };
  }

  if (endpoint.includes("/pixQrCode") && method === "GET") {
    return {
      encodedImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      payload: "00020126580014br.gov.bcb.pix0136mock-pix-copia-e-cola-chave-portal-empire5204000053039865802BR5913PORTAL EMPIRE6009SAO PAULO62070503***6304ABCD",
      expirationDate: new Date(Date.now() + 86400000).toISOString(),
    };
  }

  return { success: true };
}
