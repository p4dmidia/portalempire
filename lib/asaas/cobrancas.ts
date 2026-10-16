import { asaasFetch } from "./client";

export interface DadosClienteAsaas {
  name: string;
  cpfCnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
}

export interface RespostaClienteAsaas {
  object: string;
  id: string;
  name: string;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
}

export interface SplitItem {
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
}

export interface DadosCriarCobranca {
  cliente: DadosClienteAsaas;
  valor: number;
  descricao: string;
  vencimento: string; // YYYY-MM-DD
  formaPagamento?: "UNDEFINED" | "PIX" | "BOLETO" | "CREDIT_CARD";
  splitColunistaWalletId?: string | null;
  valorLiquidoColunista?: number | null;
  externalReference?: string; // ID do pedido
}

export interface RespostaCobrancaAsaas {
  object: string;
  id: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: string;
  status: string;
  dueDate: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  pixQrCode?: {
    encodedImage: string;
    payload: string;
    expirationDate: string;
  };
}

/**
 * Cria ou busca um cliente no Asaas
 */
export async function obterOuCriarClienteAsaas(
  dados: DadosClienteAsaas
): Promise<RespostaClienteAsaas> {
  const payload = {
    name: dados.name,
    email: dados.email || undefined,
    cpfCnpj: dados.cpfCnpj ? dados.cpfCnpj.replace(/\D/g, "") : undefined,
    phone: dados.phone ? dados.phone.replace(/\D/g, "") : undefined,
    mobilePhone: (dados.mobilePhone || dados.phone)
      ? (dados.mobilePhone || dados.phone)?.replace(/\D/g, "")
      : undefined,
  };

  return asaasFetch<RespostaClienteAsaas>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Cria uma cobrança com split de pagamento para a wallet do colunista
 */
export async function criarCobrancaComSplit(
  dados: DadosCriarCobranca
): Promise<RespostaCobrancaAsaas> {
  // 1. Cadastrar cliente
  const clienteAsaas = await obterOuCriarClienteAsaas(dados.cliente);

  // 2. Montar split se houver wallet do colunista e valor positivo
  const split: SplitItem[] = [];
  if (
    dados.splitColunistaWalletId &&
    dados.valorLiquidoColunista &&
    dados.valorLiquidoColunista > 0
  ) {
    split.push({
      walletId: dados.splitColunistaWalletId,
      fixedValue: Number(dados.valorLiquidoColunista.toFixed(2)),
    });
  }

  const payload: Record<string, unknown> = {
    customer: clienteAsaas.id,
    billingType: dados.formaPagamento || "UNDEFINED",
    value: Number(dados.valor.toFixed(2)),
    dueDate: dados.vencimento,
    description: dados.descricao,
    externalReference: dados.externalReference,
    postalService: false,
  };

  if (split.length > 0) {
    payload.split = split;
  }

  const cobranca = await asaasFetch<RespostaCobrancaAsaas>("/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // 3. Buscar QR Code PIX para cobrança
  try {
    const pixData = await asaasFetch<{
      encodedImage: string;
      payload: string;
      expirationDate: string;
    }>(`/payments/${cobranca.id}/pixQrCode`, { method: "GET" });

    cobranca.pixQrCode = pixData;
  } catch (err) {
    console.warn("Não foi possível obter QR Code PIX imediato:", err);
  }

  return cobranca;
}
