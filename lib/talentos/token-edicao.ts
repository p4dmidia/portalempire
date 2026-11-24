import crypto from "crypto";

const SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXTAUTH_SECRET ||
  "portal-empire-talentos-auth-secret-key-2026";

/**
 * Gera um token de edição assinado com validade de 7 dias
 */
export function gerarTokenEdicao(talentoId: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 dias
  const payload = `${talentoId}:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

/**
 * Valida o token de edição e retorna o ID do talento se for válido
 */
export function validarTokenEdicao(token: string): {
  valido: boolean;
  talentoId?: string;
  error?: string;
} {
  try {
    if (!token || typeof token !== "string") {
      return { valido: false, error: "Token não fornecido." };
    }

    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) {
      return { valido: false, error: "Formato de token inválido." };
    }

    const [talentoId, expiresAtStr, signature] = parts;
    const expiresAt = Number(expiresAtStr);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return { valido: false, error: "Token expirado. Solicite acesso novamente com seu e-mail e telefone." };
    }

    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(`${talentoId}:${expiresAt}`)
      .digest("hex");

    if (
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return { valido: true, talentoId };
    }

    return { valido: false, error: "Assinatura do token inválida." };
  } catch (err) {
    return { valido: false, error: "Falha na validação do token." };
  }
}
