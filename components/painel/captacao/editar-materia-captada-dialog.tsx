"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Categoria, Cidade } from "@/lib/portal/queries";

export interface MateriaCaptada {
  id: string;
  titulo: string;
  resumo?: string | null;
  status: string;
  categoria?: { id: string; nome: string };
  cidade?: { id: string; nome: string } | null;
  categoria_id?: string;
  cidade_id?: string | null;
}

interface EditarMateriaCaptadaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materia: MateriaCaptada | null;
  categorias: Categoria[];
  cidades: Cidade[];
  onSuccess: () => void;
}

export function EditarMateriaCaptadaDialog({
  open,
  onOpenChange,
  materia,
  categorias,
  cidades,
  onSuccess,
}: EditarMateriaCaptadaDialogProps) {
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [cidadeId, setCidadeId] = useState("");
  const [status, setStatus] = useState("publicado");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (materia) {
      setTitulo(materia.titulo || "");
      setResumo(materia.resumo || "");
      setCategoriaId(materia.categoria_id || materia.categoria?.id || categorias[0]?.id || "");
      setCidadeId(materia.cidade_id || materia.cidade?.id || "");
      setStatus(materia.status || "publicado");
    }
    setError(null);
  }, [materia, categorias, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materia?.id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/captacao/materias/${materia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          resumo: resumo.trim() || null,
          categoria_id: categoriaId,
          cidade_id: cidadeId || null,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar matéria.");
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Notícia Captada</DialogTitle>
          <DialogDescription>
            Ajuste a editoria, cidade de vinculação ou status da notícia captada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit_titulo">Título</Label>
            <Input
              id="edit_titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_resumo">Resumo / Lead</Label>
            <Textarea
              id="edit_resumo"
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_cat">Editoria / Categoria</Label>
              <select
                id="edit_cat"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
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

            <div className="space-y-1.5">
              <Label htmlFor="edit_cid">Cidade</Label>
              <select
                id="edit_cid"
                value={cidadeId}
                onChange={(e) => setCidadeId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Nenhuma / Âmbito Geral</option>
                {cidades.map((cid) => (
                  <option key={cid.id} value={cid.id}>
                    {cid.nome} ({cid.uf})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_status">Status da Matéria</Label>
            <select
              id="edit_status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="publicado">Publicado (Visível no portal)</option>
              <option value="rascunho">Rascunho / Despublicado (Oculto)</option>
              <option value="arquivado">Arquivado</option>
            </select>
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
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
