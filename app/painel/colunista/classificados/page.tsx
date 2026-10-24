import { requireRole } from "@/lib/auth";
import { getClassificados } from "@/lib/portal/classificados-queries";
import { ClassificadosGerenciador } from "@/components/painel/classificados/classificados-gerenciador";

export const dynamic = "force-dynamic";

export default async function ColunistaClassificadosPage() {
  const profile = await requireRole(["admin", "colunista"]);
  
  // No painel do colunista, exibe os classificados do próprio colunista
  // (ou todos se o colunista quiser visualizar o catálogo)
  const todosItens = await getClassificados();
  const meusItens = todosItens.filter((i) => i.autor_id === profile.id || !i.autor_id);

  return (
    <ClassificadosGerenciador
      initialItens={meusItens.length > 0 ? meusItens : todosItens}
      role="colunista"
      usuarioId={profile.id}
      usuarioNome={profile.nome || "Colunista"}
    />
  );
}
