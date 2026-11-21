import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TotensGerenciador } from "@/components/painel/admin/totens/totens-gerenciador";
import type { Totem, TotemSolicitacao } from "@/lib/totens/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gerenciador de Totens — Painel Administrativo",
  description: "Cadastro de totens publicitários, franqueados e propostas comerciais.",
};

export default async function AdminTotensPage() {
  const profile = await requireRole(["admin"]);
  const adminSupabase = getSupabaseAdmin();

  let totens: Totem[] = [];
  let solicitacoes: TotemSolicitacao[] = [];

  try {
    const [totensRes, solicRes] = await Promise.all([
      adminSupabase
        .from("totens")
        .select("*")
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false }),
      adminSupabase
        .from("totens_solicitacoes")
        .select("*, totem:totens(id, nome, estabelecimento_nome, cidade_nome, foto_url)")
        .order("created_at", { ascending: false }),
    ]);

    if (!totensRes.error && totensRes.data) {
      totens = totensRes.data as Totem[];
    }
    if (!solicRes.error && solicRes.data) {
      solicitacoes = solicRes.data as TotemSolicitacao[];
    }
  } catch (err) {
    console.warn("Aviso ao carregar totens no painel:", err);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <TotensGerenciador
        initialTotens={totens}
        initialSolicitacoes={solicitacoes}
        usuarioNome={profile.nome || "Administrador"}
      />
    </div>
  );
}
