import { decodificarEntidadesHtml } from "@/lib/portal/texto-utils";

export function slugify(text: string): string {
  const decodificado = decodificarEntidadesHtml(text);
  return decodificado
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres inválidos
    .replace(/[\s_-]+/g, "-") // Substitui espaços e underlines por hífen
    .replace(/^-+|-+$/g, ""); // Remove hífens no início e fim
}
