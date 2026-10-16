"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Palette,
  Save,
  CheckCircle2,
  AlertCircle,
  MoveUp,
  MoveDown,
  Plus,
  Trash2,
  Tv,
  Video,
  Share2,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Edit2,
  RefreshCw,
} from "lucide-react";

interface ShortItem {
  id: string;
  youtube_id: string;
  titulo: string;
  ordem: number;
  ativo: boolean;
}

interface EditoriaItem {
  id: string;
  nome: string;
  slug: string;
  cor: string | null;
  exibir_home: boolean;
  ordem_home: number;
}

const BLOCOS_INFO: Record<string, { nome: string; descricao: string }> = {
  destaques: {
    nome: "1. Destaques Principais",
    descricao: "Grade nobre da Home: 1 matéria grande + 4 matérias secundárias.",
  },
  grade_cards: {
    nome: "2. Em Foco no Portal (Cards)",
    descricao: "Grade de 3 cards em destaque com imagens e resumo.",
  },
  recentes_mais_lidas: {
    nome: "3. Mais Recentes & Mais Lidas",
    descricao: "Coluna de 8 matérias mais recentes com sidebar lateral das mais lidas e banner.",
  },
  carrossel_rapidas: {
    nome: "4. Notícias Rápidas (Carrossel)",
    descricao: "Faixa de cartões horizontais compactos para notícias ágeis.",
  },
  cidades: {
    nome: "5. Cidades em Evidência",
    descricao: "Grade com as principais cidades e atalhos para páginas municipais.",
  },
  shorts_tv: {
    nome: "6. TV ao Vivo & Shorts",
    descricao: "Player da transmissão ao vivo e grade de vídeos curtos verticais.",
  },
  editorias: {
    nome: "7. Blocos por Editoria",
    descricao: "Seções temáticas de matérias separadas por categoria (Política, Economia, etc.).",
  },
  colunistas: {
    nome: "8. Carrossel de Colunistas",
    descricao: "Destaque para colunistas locais com fotos e últimas publicações.",
  },
  faixa_fontes: {
    nome: "9. Faixa de Veículos Parceiros",
    descricao: "Logos dos veículos de notícias parceiros e fontes RSS.",
  },
};

const CORES_PREDEFINIDAS = [
  { nome: "Azul Royal", hex: "#2563eb" },
  { nome: "Azul Petróleo", hex: "#0284c7" },
  { nome: "Vermelho Notícias", hex: "#dc2626" },
  { nome: "Rosa Carmim", hex: "#e11d48" },
  { nome: "Verde Esmeralda", hex: "#059669" },
  { nome: "Roxo Moderno", hex: "#7c3aed" },
  { nome: "Âmbar Jornal", hex: "#d97706" },
  { nome: "Grafite Escuro", hex: "#0f172a" },
];

export function AparenciaView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [dominio, setDominio] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#2563eb");
  const [descricaoSeo, setDescricaoSeo] = useState("");
  const [youtubeLiveUrl, setYoutubeLiveUrl] = useState("");

  // Socials
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");
  const [xTwitter, setXTwitter] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Blocos Home
  const [ordemBlocos, setOrdemBlocos] = useState<string[]>([]);

  // Editorias Home
  const [editorias, setEditorias] = useState<EditoriaItem[]>([]);

  // Shorts
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [showShortModal, setShowShortModal] = useState(false);
  const [editingShort, setEditingShort] = useState<ShortItem | null>(null);
  const [shortTitulo, setShortTitulo] = useState("");
  const [shortYoutubeId, setShortYoutubeId] = useState("");

  const carregarDados = async () => {
    try {
      const res = await fetch("/api/admin/aparencia");
      if (res.ok) {
        const data = await res.json();
        const p = data.portal || {};
        setNome(p.nome || "");
        setDominio(p.dominio || "");
        setLogoUrl(p.logo_url || "");
        setCorPrimaria(p.cor_primaria || "#2563eb");
        setDescricaoSeo(p.descricao_seo || "");
        setYoutubeLiveUrl(p.youtube_live_url || "");

        const redes = p.redes_sociais || {};
        setInstagram(redes.instagram || "");
        setFacebook(redes.facebook || "");
        setYoutube(redes.youtube || "");
        setXTwitter(redes.x || redes.twitter || "");
        setWhatsapp(redes.whatsapp || "");

        setOrdemBlocos(data.ordem_blocos_home || Object.keys(BLOCOS_INFO));
        setEditorias(data.editorias || []);
        setShorts(data.shorts || []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados de aparência:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Mover bloco para cima
  const moverBlocoCima = (index: number) => {
    if (index === 0) return;
    const novos = [...ordemBlocos];
    const temp = novos[index - 1];
    novos[index - 1] = novos[index];
    novos[index] = temp;
    setOrdemBlocos(novos);
  };

  // Mover bloco para baixo
  const moverBlocoBaixo = (index: number) => {
    if (index === ordemBlocos.length - 1) return;
    const novos = [...ordemBlocos];
    const temp = novos[index + 1];
    novos[index + 1] = novos[index];
    novos[index] = temp;
    setOrdemBlocos(novos);
  };

  // Mover editoria para cima
  const moverEditoriaCima = (index: number) => {
    if (index === 0) return;
    const novos = [...editorias];
    const temp = novos[index - 1];
    novos[index - 1] = novos[index];
    novos[index] = temp;
    const atualizados = novos.map((ed, i) => ({ ...ed, ordem_home: i + 1 }));
    setEditorias(atualizados);
  };

  // Mover editoria para baixo
  const moverEditoriaBaixo = (index: number) => {
    if (index === editorias.length - 1) return;
    const novos = [...editorias];
    const temp = novos[index + 1];
    novos[index + 1] = novos[index];
    novos[index] = temp;
    const atualizados = novos.map((ed, i) => ({ ...ed, ordem_home: i + 1 }));
    setEditorias(atualizados);
  };

  // Alternar exibir editoria na Home
  const toggleExibirEditoriaHome = (id: string) => {
    setEditorias((prev) =>
      prev.map((ed) => (ed.id === id ? { ...ed, exibir_home: !ed.exibir_home } : ed))
    );
  };

  // Salvar tudo
  const handleSalvar = async () => {
    setSaving(true);
    setMensagem(null);
    try {
      const payload = {
        nome,
        dominio: dominio || null,
        logo_url: logoUrl || null,
        cor_primaria: corPrimaria,
        descricao_seo: descricaoSeo || null,
        youtube_live_url: youtubeLiveUrl || null,
        redes_sociais: {
          instagram,
          facebook,
          youtube,
          x: xTwitter,
          whatsapp,
        },
        ordem_blocos_home: ordemBlocos,
        ordem_editorias_home: editorias.map((ed, idx) => ({
          id: ed.id,
          ordem_home: idx + 1,
          exibir_home: ed.exibir_home,
        })),
      };

      const res = await fetch("/api/admin/aparencia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Erro ao salvar alterações.");
      }

      setMensagem({
        tipo: "sucesso",
        texto: "Configurações de aparência e ordem da Home salvas com sucesso!",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const text = err instanceof Error ? err.message : "Erro desconhecido.";
      setMensagem({ tipo: "erro", texto: text });
    } finally {
      setSaving(false);
    }
  };

  // Salvar Short
  const handleSaveShort = async () => {
    if (!shortTitulo.trim() || !shortYoutubeId.trim()) return;
    try {
      if (editingShort) {
        // Atualizar
        const res = await fetch(`/api/admin/shorts/${editingShort.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: shortTitulo,
            youtube_id: shortYoutubeId,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          setShorts((prev) =>
            prev.map((s) => (s.id === editingShort.id ? json.short : s))
          );
          setShowShortModal(false);
          setEditingShort(null);
        }
      } else {
        // Criar
        const res = await fetch("/api/admin/shorts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: shortTitulo,
            youtube_id: shortYoutubeId,
            ordem: shorts.length + 1,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          setShorts((prev) => [...prev, json.short]);
          setShowShortModal(false);
        }
      }
    } catch (err) {
      console.error("Erro ao salvar short:", err);
    }
  };

  // Excluir Short
  const handleDeleteShort = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo Short?")) return;
    try {
      const res = await fetch(`/api/admin/shorts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setShorts((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Erro ao excluir short:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            Aparência & Ordem da Home
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Personalize identidade visual, logo, cores, redes sociais, TV ao vivo e reordene os blocos da página inicial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="w-4 h-4" />
              Ver Portal
            </Button>
          </a>
          <Button onClick={handleSalvar} disabled={saving} size="sm" className="gap-1.5 shadow-sm">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      {/* Alerta de Sucesso / Erro */}
      {mensagem && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-start gap-3 border ${
            mensagem.tipo === "sucesso"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {mensagem.tipo === "sucesso" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          )}
          <div>
            <p className="font-semibold">
              {mensagem.tipo === "sucesso" ? "Sucesso" : "Atenção"}
            </p>
            <p className="text-xs mt-0.5">{mensagem.texto}</p>
          </div>
        </div>
      )}

      {/* SEÇÃO 1: Identidade & Cores */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <ImageIcon className="w-4 h-4 text-primary" />
          Identidade Visual & Cores
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nome do Portal
            </label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Portal Empire"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Domínio Personalizado
            </label>
            <Input
              value={dominio}
              onChange={(e) => setDominio(e.target.value)}
              placeholder="Ex: portalempire.com.br"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              URL da Logomarca (PNG/SVG/WebP com fundo transparente)
            </label>
            <div className="flex gap-3 items-center">
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="/logo.png"
                className="flex-1"
              />
              <div className="p-2 border border-slate-800 rounded-xl bg-slate-950 h-10 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl || "/logo.png"} alt="Preview Logo" className="max-h-7 max-w-28 object-contain" />
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Cor Primária do Portal
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-800">
                <input
                  type="color"
                  value={corPrimaria}
                  onChange={(e) => setCorPrimaria(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="font-mono text-xs font-bold">{corPrimaria}</span>
              </div>

              {CORES_PREDEFINIDAS.map((cor) => (
                <button
                  key={cor.hex}
                  type="button"
                  onClick={() => setCorPrimaria(cor.hex)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    corPrimaria.toLowerCase() === cor.hex.toLowerCase()
                      ? "border-slate-900 dark:border-white shadow-sm ring-2 ring-primary/30"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cor.hex }} />
                  <span>{cor.nome}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Descrição SEO (Meta Description da Home)
            </label>
            <Textarea
              value={descricaoSeo}
              onChange={(e) => setDescricaoSeo(e.target.value)}
              rows={2}
              placeholder="Portal de notícias diário com cobertura regional, colunistas de cidades e captação em tempo real."
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: Redes Sociais & Transmissão ao Vivo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Share2 className="w-4 h-4 text-primary" />
          Redes Sociais & TV ao Vivo
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Instagram</label>
            <Input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/seuperfil"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Facebook</label>
            <Input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/suapagina"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">YouTube Canal</label>
            <Input
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="https://youtube.com/@seucanal"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">X (Twitter)</label>
            <Input
              value={xTwitter}
              onChange={(e) => setXTwitter(e.target.value)}
              placeholder="https://x.com/seuperfil"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">WhatsApp (Link ou Canal)</label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="https://whatsapp.com/channel/..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-red-600" />
              URL da Transmissão TV ao Vivo (Embed YouTube)
            </label>
            <Input
              value={youtubeLiveUrl}
              onChange={(e) => setYoutubeLiveUrl(e.target.value)}
              placeholder="https://www.youtube.com/embed/live_stream?channel=..."
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: Reordenação dos Blocos da Home */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Ordem dos Blocos da Página Inicial (Home)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reordene como os blocos aparecem na Home para os visitantes.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {ordemBlocos.map((blocoId, index) => {
            const info = BLOCOS_INFO[blocoId] || { nome: blocoId, descricao: "" };
            return (
              <div
                key={blocoId}
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs gap-3 transition-all hover:border-slate-400"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center font-mono text-[11px] shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {info.nome}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{info.descricao}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moverBlocoCima(index)}
                    className="h-8 w-8 p-0"
                    title="Mover para cima"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === ordemBlocos.length - 1}
                    onClick={() => moverBlocoBaixo(index)}
                    className="h-8 w-8 p-0"
                    title="Mover para baixo"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO 4: Ordem e Visibilidade das Editorias na Home */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Editorias em Destaque na Home
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Defina a ordem e quais editorias devem ter bloco dedicado na Home.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {editorias.map((ed, index) => (
            <div
              key={ed.id}
              className={`flex items-center justify-between p-3 border rounded-xl text-xs gap-3 ${
                ed.exibir_home
                  ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60"
                  : "bg-slate-100/40 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: ed.cor || "#2563eb" }}
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white mr-2">
                    {ed.nome}
                  </span>
                  <span className="text-[11px] text-slate-400">/{ed.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant={ed.exibir_home ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleExibirEditoriaHome(ed.id)}
                  className="h-7 text-[11px] px-2.5"
                >
                  {ed.exibir_home ? "Exibir na Home" : "Oculta"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moverEditoriaCima(index)}
                  className="h-8 w-8 p-0"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === editorias.length - 1}
                  onClick={() => moverEditoriaBaixo(index)}
                  className="h-8 w-8 p-0"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 5: CRUD de Vídeos Shorts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-600" />
              Vídeos Shorts do YouTube
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cadastre vídeos curtos verticais para exibição na grade de Shorts da Home.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setEditingShort(null);
              setShortTitulo("");
              setShortYoutubeId("");
              setShowShortModal(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Adicionar Short
          </Button>
        </div>

        {shorts.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Nenhum vídeo Short cadastrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {shorts.map((s) => (
              <div
                key={s.id}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-inner mb-2">
                    <iframe
                      src={`https://www.youtube.com/embed/${s.youtube_id}`}
                      title={s.titulo}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                    {s.titulo}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {s.youtube_id}</p>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingShort(s);
                      setShortTitulo(s.titulo);
                      setShortYoutubeId(s.youtube_id);
                      setShowShortModal(true);
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteShort(s.id)}
                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal / Dialog de Short */}
      {showShortModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingShort ? "Editar Vídeo Short" : "Novo Vídeo Short"}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Título do Vídeo
                </label>
                <Input
                  value={shortTitulo}
                  onChange={(e) => setShortTitulo(e.target.value)}
                  placeholder="Ex: Bastidores da Cobertura"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Link do YouTube ou ID do Vídeo
                </label>
                <Input
                  value={shortYoutubeId}
                  onChange={(e) => setShortYoutubeId(e.target.value)}
                  placeholder="https://youtube.com/shorts/dQw4w9WgXcQ"
                />
                <p className="text-[10px] text-slate-400">
                  Aceita link completo de short, link normal do YouTube ou o ID direto.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShortModal(false)}
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveShort}>
                Salvar Short
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Botão de Salvar Flutuante / Rodapé */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button onClick={handleSalvar} disabled={saving} className="gap-2 shadow-md">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Salvando alterações..." : "Salvar Todas as Configurações"}
        </Button>
      </div>
    </div>
  );
}
