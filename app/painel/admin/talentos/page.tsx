import { requireRole } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TalentosGerenciador } from "@/components/painel/admin/talentos/talentos-gerenciador";
import { TALENTOS_MOCK } from "@/lib/talentos/queries";
import type { Talento, TalentoSolicitacao } from "@/lib/talentos/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gerenciador de Talentos & Celebridades — Painel Administrativo",
  description: "Cadastro de influenciadores, apresentadores, celebridades e gestão de orçamentos.",
};

export default async function AdminTalentosPage() {
  const profile = await requireRole(["admin"]);
  const adminSupabase = getSupabaseAdmin();

  let talentos: Talento[] = [];
  let solicitacoes: TalentoSolicitacao[] = [];

  try {
    const [talentosRes, solicRes] = await Promise.all([
      adminSupabase
        .from("talentos")
        .select("*")
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false }),
      adminSupabase
        .from("talentos_solicitacoes")
        .select("*, talento:talentos(id, nome, slug, foto_url, titulo_profissional, whatsapp)")
        .order("created_at", { ascending: false }),
    ]);

    if (!talentosRes.error && talentosRes.data) {
      talentos = talentosRes.data as Talento[];
    }
    if (!solicRes.error && solicRes.data) {
      solicitacoes = solicRes.data as TalentoSolicitacao[];
    }
  } catch (err) {
    console.warn("Aviso ao carregar dados de talentos no painel:", err);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <TalentosGerenciador
        initialTalentos={talentos}
        initialSolicitacoes={solicitacoes}
        usuarioNome={profile.nome || "Administrador"}
      />
    </div>
  );
}
