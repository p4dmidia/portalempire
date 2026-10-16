"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Eye,
  Menu,
} from "lucide-react";


interface Editoria {
  id: string;
  nome: string;
  slug: string;
  pai_id: string | null;
  exibir_menu: boolean;
  exibir_home: boolean;
  ordem_menu: number;
  ordem_home: number;
  cor: string | null;
  palavras_chave: string[];
  total_materias?: number;
  pai?: { id: string; nome: string } | null;
}

export function EditoriasView() {
  const [editorias, setEditorias] = useState<Editoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Editoria | null>(null);
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [paiId, setPaiId] = useState<string>("");
  const [cor, setCor] = useState("#2563eb");
  const [palavrasChaveStr, setPalavrasChaveStr] = useState("");
  const [ordemMenu, setOrdemMenu] = useState(0);
  const [ordemHome, setOrdemHome] = useState(0);
  const [exibirMenu, setExibirMenu] = useState(true);
  const [exibirHome, setExibirHome] = useState(true);

  const carregarEditorias = async () => {
    try {
      const res = await fetch("/api/admin/editorias");
      if (res.ok) {
        const json = await res.json();
        setEditorias(json.editorias || []);
      }
    } catch (err) {
      console.error("Erro ao carregar editorias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEditorias();
  }, []);

  const handleOpenModal = (item?: Editoria) => {
    if (item) {
      setEditingItem(item);
      setNome(item.nome);
      setSlug(item.slug);
      setPaiId(item.pai_id || "");
      setCor(item.cor || "#2563eb");
      setPalavrasChaveStr((item.palavras_chave || []).join(", "));
      setOrdemMenu(item.ordem_menu || 0);
      setOrdemHome(item.ordem_home || 0);
      setExibirMenu(item.exibir_menu);
      setExibirHome(item.exibir_home);
    } else {
      setEditingItem(null);
      setNome("");
      setSlug("");
      setPaiId("");
      setCor("#2563eb");
      setPalavrasChaveStr("");
      setOrdemMenu(editorias.length + 1);
      setOrdemHome(editorias.length + 1);
      setExibirMenu(true);
      setExibirHome(true);
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
      pai_id: paiId || null,
      cor: cor || null,
      palavras_chave,
      ordem_menu: Number(ordemMenu),
      ordem_home: Number(ordemHome),
      exibir_menu: exibirMenu,
      exibir_home: exibirHome,
    };

    try {
      if (editingItem) {
        const res = await fetch(`/api/admin/editorias/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erro ao atualizar.");
      } else {
        const res = await fetch("/api/admin/editorias", {
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
          ? "Editoria atualizada com sucesso!"
          : "Editoria criada com sucesso!",
      });
      setModalOpen(false);
      carregarEditorias();
    } catch (err) {
      const text = err instanceof Error ? err.message : "Erro desconhecido.";
      setMensagem({ tipo: "erro", texto: text });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nomeEditoria: string) => {
    if (!confirm(`Tem certeza que deseja excluir a editoria "${nomeEditoria}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/editorias/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Erro ao excluir editoria.");
        return;
      }
      setMensagem({ tipo: "sucesso", texto: "Editoria excluída com sucesso!" });
      carregarEditorias();
    } catch (err) {
      console.error("Erro ao excluir editoria:", err);
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
            <FolderTree className="w-6 h-6 text-primary" />
            Editorias do Portal
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerencie categorias temáticas, palavras-chave para classificação automática de RSS e ordem nos menus.
          </p>
        </div>

        <Button onClick={() => handleOpenModal()} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          Nova Editoria
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

      {/* Tabela de Editorias */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Editoria</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Hierarquia</th>
                <th className="py-3.5 px-4">Palavras-Chave (RSS)</th>
                <th className="py-3.5 px-4 text-center">Exibição</th>
                <th className="py-3.5 px-4 text-center">Matérias</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {editorias.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.cor || "#2563eb" }}
                      />
                      <span>{cat.nome}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    /{cat.slug}
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {cat.pai ? (
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        ↳ Sub de {cat.pai.nome}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Principal</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(cat.palavras_chave || []).slice(0, 4).map((kw, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px]"
                        >
                          {kw}
                        </span>
                      ))}
                      {(cat.palavras_chave || []).length > 4 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{(cat.palavras_chave || []).length - 4}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[11px]">
                      {cat.exibir_menu && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-semibold" title="Exibida no Menu">
                          <Menu className="w-3 h-3" /> Menu ({cat.ordem_menu})
                        </span>
                      )}
                      {cat.exibir_home && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 font-semibold" title="Exibida na Home">
                          <Eye className="w-3 h-3" /> Home ({cat.ordem_home})
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                    {cat.total_materias || 0}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(cat)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cat.id, cat.nome)}
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

      {/* Modal Criar / Editar Editoria */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-primary" />
              {editingItem ? "Editar Editoria" : "Nova Editoria"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Nome da Editoria *
                  </label>
                  <Input
                    required
                    value={nome}
                    onChange={(e) => handleNomeChange(e.target.value)}
                    placeholder="Ex: Agronegócio"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Slug (URL) *
                  </label>
                  <Input
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="ex: agronegocio"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Editoria Pai (Opcional)
                  </label>
                  <select
                    value={paiId}
                    onChange={(e) => setPaiId(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs"
                  >
                    <option value="">Nenhuma (Editoria Principal)</option>
                    {editorias
                      .filter((e) => !editingItem || e.id !== editingItem.id)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nome}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Cor da Categoria
                  </label>
                  <div className="flex items-center gap-2 h-10 px-2 border border-input rounded-md bg-background">
                    <input
                      type="color"
                      value={cor}
                      onChange={(e) => setCor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-xs font-bold">{cor}</span>
                  </div>
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
                  placeholder="agro, safra, colheita, soja, milho, pecuaria (separadas por vírgula)"
                />
                <p className="text-[11px] text-slate-400">
                  Quando o crawler RSS encontrar essas palavras no título/resumo, atribuirá esta editoria.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Ordem no Menu
                  </label>
                  <Input
                    type="number"
                    value={ordemMenu}
                    onChange={(e) => setOrdemMenu(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Ordem na Home
                  </label>
                  <Input
                    type="number"
                    value={ordemHome}
                    onChange={(e) => setOrdemHome(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={exibirMenu}
                    onChange={(e) => setExibirMenu(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Exibir no Menu Superior</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={exibirHome}
                    onChange={(e) => setExibirHome(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Exibir Bloco na Home</span>
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
                  {saving ? "Salvando..." : "Salvar Editoria"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
