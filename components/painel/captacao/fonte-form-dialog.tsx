"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import type { Categoria, Cidade } from "@/lib/portal/queries";

export interface FonteRSS {
  id?: string;
  nome: string;
  veiculo: string;
  url_feed: string;
  categoria_padrao_id: string;
  cidade_padrao_id?: string | null;
  ativo: boolean;
  intervalo_minutos: number;
  max_itens_por_execucao: number;
  publicar_automatico: boolean;
  ultima_execucao?: string | null;
  ultimo_status?: string | null;
  ultimo_erro?: string | null;
  total_importadas?: number;
}

interface FonteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fonte?: FonteRSS | null;
  categorias: Categoria[];
  cidades: Cidade[];
  onSuccess: () => void;
}

export function FonteFormDialog({
  open,
  onOpenChange,
  fonte,
  categorias,
  cidades,
  onSuccess,
}: FonteFormDialogProps) {
  const isEditing = Boolean(fonte?.id);

  const [nome, setNome] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [urlFeed, setUrlFeed] = useState("");
  const [categoriaPadraoId, setCategoriaPadraoId] = useState("");
  const [cidadePadraoId, setCidadePadraoId] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [intervaloMinutos, setIntervaloMinutos] = useState(15);
  const [maxItens, setMaxItens] = useState(20);
  const [publicarAutomatico, setPublicarAutomatico] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [buscaCidade, setBuscaCidade] = useState("");
  const [cidadeDropdownOpen, setCidadeDropdownOpen] = useState(false);

  useEffect(() => {
    if (fonte) {
      setNome(fonte.nome || "");
      setVeiculo(fonte.veiculo || "");
      setUrlFeed(fonte.url_feed || "");
      setCategoriaPadraoId(fonte.categoria_padrao_id || (categorias[0]?.id || ""));
      setCidadePadraoId(fonte.cidade_padrao_id || "");
      const cidNome = cidades.find((c) => c.id === fonte.cidade_padrao_id)?.nome || "";
      setBuscaCidade(cidNome);
      setAtivo(fonte.ativo !== false);
      setIntervaloMinutos(fonte.intervalo_minutos || 15);
      setMaxItens(fonte.max_itens_por_execucao || 20);
      setPublicarAutomatico(fonte.publicar_automatico !== false);
    } else {
      setNome("");
      setVeiculo("");
      setUrlFeed("");
      setCategoriaPadraoId(categorias[0]?.id || "");
      setCidadePadraoId("");
      setBuscaCidade("");
      setAtivo(true);
      setIntervaloMinutos(15);
      setMaxItens(20);
      setPublicarAutomatico(true);
    }
    setError(null);
  }, [fonte, categorias, cidades, open]);

  const cidadesFiltradas = cidades.filter((c) =>
    c.nome.toLowerCase().includes(buscaCidade.toLowerCase()) ||
    c.uf.toLowerCase().includes(buscaCidade.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !veiculo.trim() || !urlFeed.trim() || !categoriaPadraoId) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/captacao/fontes/${fonte?.id}`
        : `/api/admin/captacao/fontes`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          veiculo: veiculo.trim(),
          url_feed: urlFeed.trim(),
          categoria_padrao_id: categoriaPadraoId,
          cidade_padrao_id: cidadePadraoId || null,
          ativo,
          intervalo_minutos: Number(intervaloMinutos),
          max_itens_por_execucao: Number(maxItens),
          publicar_automatico: publicarAutomatico,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar fonte RSS.");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent preventOutsideClose={true} className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Editar Fonte RSS" : "Cadastrar Nova Fonte RSS"}
          </DialogTitle>
          <DialogDescription>
            Configure o feed RSS/Atom para captação automática de notícias do veículo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fonte_nome">Nome da Fonte *</Label>
              <Input
                id="fonte_nome"
                placeholder="Ex: G1 - Política Nacional"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fonte_veiculo">Veículo / Marca *</Label>
              <Input
                id="fonte_veiculo"
                placeholder="Ex: G1, Folha, CNN"
                value={veiculo}
                onChange={(e) => setVeiculo(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fonte_url">URL do Feed (RSS / Atom) *</Label>
            <Input
              id="fonte_url"
              placeholder="https://exemplo.com/rss/noticias.xml"
              value={urlFeed}
              onChange={(e) => setUrlFeed(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="categoria_padrao">Editoria / Categoria Padrão *</Label>
              <select
                id="categoria_padrao"
                value={categoriaPadraoId}
                onChange={(e) => setCategoriaPadraoId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                required
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <Label htmlFor="cidade_busca">Cidade Padrão (Opcional)</Label>
                {cidadePadraoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setCidadePadraoId("");
                      setBuscaCidade("");
                    }}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="cidade_busca"
                  type="text"
                  placeholder="Digite para buscar cidade..."
                  value={buscaCidade}
                  onFocus={() => setCidadeDropdownOpen(true)}
                  onChange={(e) => {
                    setBuscaCidade(e.target.value);
                    setCidadeDropdownOpen(true);
                    if (!e.target.value) {
                      setCidadePadraoId("");
                    }
                  }}
                  autoComplete="off"
                />
              </div>

              {cidadeDropdownOpen && (
                <div
                  className="absolute z-50 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg text-sm"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div
                    onClick={() => {
                      setCidadePadraoId("");
                      setBuscaCidade("");
                      setCidadeDropdownOpen(false);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800"
                  >
                    Nenhuma (Automático por palavras-chave)
                  </div>
                  {cidadesFiltradas.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-400">
                      Nenhuma cidade encontrada
                    </div>
                  ) : (
                    cidadesFiltradas.map((cid) => (
                      <div
                        key={cid.id}
                        onClick={() => {
                          setCidadePadraoId(cid.id);
                          setBuscaCidade(`${cid.nome} (${cid.uf})`);
                          setCidadeDropdownOpen(false);
                        }}
                        className={`px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between ${
                          cidadePadraoId === cid.id ? "bg-primary/10 text-primary font-medium" : ""
                        }`}
                      >
                        <span>{cid.nome}</span>
                        <span className="text-xs text-slate-400">{cid.uf}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="intervalo">Intervalo de Checagem (minutos)</Label>
              <Input
                id="intervalo"
                type="number"
                min={5}
                max={1440}
                value={intervaloMinutos}
                onChange={(e) => setIntervaloMinutos(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max_itens">Máximo de Itens por Execução</Label>
              <Input
                id="max_itens"
                type="number"
                min={1}
                max={50}
                value={maxItens}
                onChange={(e) => setMaxItens(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-semibold text-sm">Fonte Ativa</Label>
                <p className="text-xs text-slate-500">
                  Desative temporariamente para pausar a coleta deste feed.
                </p>
              </div>
              <Switch checked={ativo} onCheckedChange={setAtivo} />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <Label className="font-semibold text-sm">Publicar Automaticamente</Label>
                <p className="text-xs text-slate-500">
                  Se ativado, novas matérias vão direto para o portal com status &quot;publicado&quot;.
                </p>
              </div>
              <Switch checked={publicarAutomatico} onCheckedChange={setPublicarAutomatico} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Salvar Alterações"
              ) : (
                "Criar Fonte"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
