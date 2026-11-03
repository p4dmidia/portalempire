import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const FUSO_HORARIO_PADRAO = "America/Sao_Paulo";

/**
 * Converte qualquer entrada de data (string ISO, timestamp ou Date) para um objeto Date válido.
 */
export function normalizarData(dataInput?: string | Date | number | null): Date | null {
  if (!dataInput) return null;
  const d = typeof dataInput === "object" ? dataInput : new Date(dataInput);
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Formata uma data por extenso no Horário de Brasília (ex.: "2 de novembro de 2026 às 13:25").
 * Possui teto temporal: se a data for futura e não for agendamento explícito, trava no momento presente.
 */
export function formatarDataBrasilia(
  dataInput?: string | Date | number | null,
  opcoes: { incluirHora?: boolean; permitirFuturo?: boolean } = { incluirHora: true, permitirFuturo: false }
): string {
  const data = normalizarData(dataInput);
  if (!data) return "";

  const agora = Date.now();
  // Trava anti-futuro: matérias publicadas nunca mostram hora no futuro
  const dataFinal = !opcoes.permitirFuturo && data.getTime() > agora ? new Date(agora) : data;

  try {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: FUSO_HORARIO_PADRAO,
      day: "numeric",
      month: "long",
      year: "numeric",
      ...(opcoes.incluirHora !== false
        ? {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        : {}),
    });

    const partes = formatter.formatToParts(dataFinal);
    let dia = "";
    let mes = "";
    let ano = "";
    let hora = "";
    let minuto = "";

    for (const p of partes) {
      if (p.type === "day") dia = p.value;
      if (p.type === "month") mes = p.value;
      if (p.type === "year") ano = p.value;
      if (p.type === "hour") hora = p.value;
      if (p.type === "minute") minuto = p.value;
    }

    if (opcoes.incluirHora !== false && hora && minuto) {
      return `${dia} de ${mes} de ${ano} às ${hora}:${minuto}`;
    }

    return `${dia} de ${mes} de ${ano}`;
  } catch (err) {
    console.warn("[Portal Empire] Erro ao formatar data no fuso de Brasília:", err);
    return dataFinal.toLocaleDateString("pt-BR");
  }
}

/**
 * Formata o tempo relativo de forma inteligente (ex.: "há 5 minutos", "há 2 horas").
 * Se a data for futura ou igual a agora, retorna sempre "agora mesmo" ou "há poucos minutos",
 * eliminando completamente o bug embaraçoso de exibir "em cerca de 3 horas".
 */
export function formatarTempoRelativo(dataInput?: string | Date | number | null): string {
  const data = normalizarData(dataInput);
  if (!data) return "";

  const agora = Date.now();
  const diffMs = agora - data.getTime();

  // Se a data estiver no futuro ou tiver menos de 45 segundos, exibe "agora mesmo"
  if (diffMs <= 45 * 1000) {
    return "agora mesmo";
  }

  return formatDistanceToNow(data, {
    addSuffix: true,
    locale: ptBR,
  });
}

/**
 * Formata data no formato curto brasileiro (ex.: "02/11/2026" ou "02/11/2026 13:25")
 */
export function formatarDataCurta(
  dataInput?: string | Date | number | null,
  incluirHora = false
): string {
  const data = normalizarData(dataInput);
  if (!data) return "";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: FUSO_HORARIO_PADRAO,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(incluirHora
        ? {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        : {}),
    }).format(data);
  } catch {
    return "";
  }
}

/**
 * Converte uma data UTC para o formato exato esperado pelo <input type="datetime-local"> ("YYYY-MM-DDTHH:mm")
 * levando em conta o fuso horário de Brasília (UTC-3), evitando que o formulário avance horas no futuro a cada edição.
 */
export function formatarParaInputLocal(dataInput?: string | Date | number | null): string {
  const data = normalizarData(dataInput);
  if (!data) return "";

  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: FUSO_HORARIO_PADRAO,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const partes = formatter.formatToParts(data);
    let ano = "";
    let mes = "";
    let dia = "";
    let hora = "";
    let minuto = "";

    for (const p of partes) {
      if (p.type === "year") ano = p.value;
      if (p.type === "month") mes = p.value;
      if (p.type === "day") dia = p.value;
      if (p.type === "hour") hora = p.value;
      if (p.type === "minute") minuto = p.value;
    }

    if (ano && mes && dia && hora && minuto) {
      return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    }

    return data.toISOString().slice(0, 16);
  } catch {
    return data.toISOString().slice(0, 16);
  }
}

