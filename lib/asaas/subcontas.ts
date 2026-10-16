import { asaasFetch } from "./client";

export interface DadosCriarSubconta {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  companyType?: "INDIVIDUAL" | "MEI" | "LIMITED" | "ASSOCIATION";
}

export interface RespostaSubcontaAsaas {
  object: string;
  id: string;
  name: string;
  email: string;
  walletId: string;
  apiKey?: string;
  accountNumber?: {
    agency: string;
    account: string;
    accountDigit: string;
  };
}

/**
 * Cria uma subconta no Asaas (white-label para colunistas) para recebimento via Split
 */
export async function criarSubcontaAsaas(
  dados: DadosCriarSubconta
): Promise<RespostaSubcontaAsaas> {
  const payload = {
    name: dados.name,
    email: dados.email,
    cpfCnpj: dados.cpfCnpj.replace(/\D/g, ""),
    phone: dados.phone?.replace(/\D/g, "") || undefined,
    mobilePhone: (dados.mobilePhone || dados.phone)?.replace(/\D/g, "") || undefined,
    address: dados.address || "Rua Principal",
    addressNumber: dados.addressNumber || "100",
    complement: dados.complement || undefined,
    province: dados.province || "Centro",
    postalCode: dados.postalCode?.replace(/\D/g, "") || "01001000",
    companyType: dados.companyType || (dados.cpfCnpj.length > 11 ? "MEI" : "INDIVIDUAL"),
    incomeValue: 5000,
  };

  return asaasFetch<RespostaSubcontaAsaas>("/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
