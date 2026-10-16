"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Star,
} from "lucide-react";

interface Cidade {
  id: string;
  nome: string;
  slug: string;
  uf: string;
  destaque_menu: boolean;
  ordem: number;
  palavras_chave: string[];
  total_colunas?: number;
  total_materias?: number;
}

export function CidadesView() {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cidade | null>(null);
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [uf, setUf] = useState("SP");
  const [ordem, setOrdem] = useState(0);
  const [destaqueMenu, setDestaqueMenu] = useState(false);
  const [palavrasChaveStr, setPalavrasChaveStr] = useState("");

  const carregarCidades = async () => {
    try {
      const res = await fetch("/api/admin/cidades");
      if (res.ok) {
        const json = await res.json();
        setCidades(json.cidades || []);
      }
    } catch (err) {
      console.error("Erro ao carregar cidades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCidades();
  }, []);

  const handleOpenModal = (item?: Cidade) => {
    if (item) {
      setEditingItem(item);
      setNome(item.nome);
      setSlug(item.slug);
      setUf(item.uf);
      setOrdem(item.ordem || 0);
      setDestaqueMenu(item.destaque_menu);
      setPalavrasChaveStr((item.palavras_chave || []).join(", "));
    } else {
      setEditingItem(null);
      setNome("");
      setSlug("");
      setUf("SP");
      setOrdem(cidades.length + 1);
      setDestaqueMenu(true);
      setPalavrasChaveStr("");
    }
    setModalOpen(true);
  };

  const handleNomeChange = (val: string) => {
    setNome(val);
    if (!editingItem) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMensagem(null);

    const palavras_chave = palavrasChaveStr
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const payload = {
      nome,
      slug,
      uf: uf.toUpperCase(),
      destaque_menu: destaqueMenu,
      ordem: Number(ordem),
      palavras_chave,
    };

    try {
      if (editingItem) {
        const res = await fetch(`/api/admin/cidades/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erro ao atualizar.");
      } else {
        const res = await fetch("/api/admin/cidades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erro ao cadastrar.");
      }

      setMensagem({
        tipo: "sucesso",
        texto: editingItem
          ? "Cidade atualizada com sucesso!"
          : "Cidade cadastrada com sucesso!",
      });
      setModalOpen(false);
      carregarCidades();
    } catch (err) {
      const text = err instanceof Error ? err.message : "Erro desconhecido.";
      setMensagem({ tipo: "erro", texto: text });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nomeCidade: string) => {
    if (!confirm(`Tem certeza que deseja excluir a cidade "${nomeCidade}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/cidades/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Erro ao excluir cidade.");
        return;
      }
      setMensagem({ tipo: "sucesso", texto: "Cidade excluída com sucesso!" });
      carregarCidades();
    } catch (err) {
      console.error("Erro ao excluir cidade:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Cidades Cobertas pelo Portal
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cadastre municípios para colunistas locais, páginas municipais e classificação de notícias no RSS.
          </p>
        </div>

        <Button onClick={() => handleOpenModal()} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          Nova Cidade
        </Button>
      </div>

      {/* Alerta */}
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
            <p className="font-semibold">{mensagem.tipo === "sucesso" ? "Sucesso" : "Erro"}</p>
            <p className="text-xs mt-0.5">{mensagem.texto}</p>
          </div>
        </div>
      )}

      {/* Tabela de Cidades */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Cidade / UF</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Palavras-Chave (RSS)</th>
                <th className="py-3.5 px-4 text-center">Destaque Menu</th>
                <th className="py-3.5 px-4 text-center">Colunas</th>
                <th className="py-3.5 px-4 text-center">Matérias</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cidades.map((cid) => (
                <tr key={cid.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span>{cid.nome}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {cid.uf}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    /cidade/{cid.slug}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(cid.palavras_chave || []).slice(0, 4).map((kw, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px]"
                        >
                          {kw}
                        </span>
                      ))}
                      {(cid.palavras_chave || []).length > 4 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{(cid.palavras_chave || []).length - 4}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {cid.destaque_menu ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Ordem {cid.ordem}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Não</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                    {cid.total_colunas || 0}
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                    {cid.total_materias || 0}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(cid)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cid.id, cid.nome)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar / Editar Cidade */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {editingItem ? "Editar Cidade" : "Nova Cidade"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Nome do Município *
                  </label>
                  <Input
                    required
                    value={nome}
                    onChange={(e) => handleNomeChange(e.target.value)}
                    placeholder="Ex: Campinas"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    UF *
                  </label>
                  <Input
                    required
                    maxLength={2}
                    value={uf}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                    placeholder="SP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Slug (URL) *
                  </label>
                  <Input
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="ex: campinas"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Ordem de Exibição
                  </label>
                  <Input
                    type="number"
                    value={ordem}
                    onChange={(e) => setOrdem(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  Palavras-Chave para Classificação Automática RSS
                </label>
                <Input
                  value={palavrasChaveStr}
                  onChange={(e) => setPalavrasChaveStr(e.target.value)}
                  placeholder="campinas, regiao metropolitana de campinas, rmc (separadas por vírgula)"
                />
                <p className="text-[11px] text-slate-400">
                  Quando o crawler RSS encontrar essas palavras no texto da matéria, atribuirá automaticamente esta cidade.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={destaqueMenu}
                    onChange={(e) => setDestaqueMenu(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Destaque na Barra Superior de Cidades</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} size="sm">
                  {saving ? "Salvando..." : "Salvar Cidade"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
