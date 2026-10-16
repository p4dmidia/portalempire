"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, ImageIcon, Columns } from "lucide-react";
import { slugify } from "@/lib/utils/slugify";
import { createClient } from "@/lib/supabase/client";
import type { CidadeData, ColunaData } from "@/lib/portal/queries";

interface ColunaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coluna?: ColunaData | null;
  cidades: CidadeData[];
  userId: string;
  userRole: string;
  onSuccess: () => void;
}

export function ColunaFormDialog({
  open,
  onOpenChange,
  coluna,
  cidades,
  userId,
  userRole,
  onSuccess,
}: ColunaFormDialogProps) {
  const isEditing = Boolean(coluna?.id);

  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [cidadeId, setCidadeId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [capaUrl, setCapaUrl] = useState("");
  const [aceitaAnuncios, setAceitaAnuncios] = useState(true);
  const [status, setStatus] = useState<"pendente" | "ativa" | "suspensa">("ativa");

  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coluna) {
      setNome(coluna.nome || "");
      setSlug(coluna.slug || "");
      setCidadeId(coluna.cidade_id || "");
      setDescricao(coluna.descricao || "");
      setCapaUrl(coluna.capa_url || "");
      setAceitaAnuncios(coluna.aceita_anuncios !== false);
      setStatus(coluna.status || "ativa");
    } else {
      setNome("");
      setSlug("");
      setCidadeId("");
      setDescricao("");
      setCapaUrl("");
      setAceitaAnuncios(true);
      setStatus(userRole === "admin" ? "ativa" : "pendente");
    }
    setError(null);
  }, [coluna, userRole, open]);

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNome(val);
    if (!isEditing) {
      setSlug(slugify(val));
    }
  };

  const handleUploadCapa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A capa não pode ultrapassar 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop() || "webp";
      const fileName = `${userId}/capa-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("colunas")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("colunas")
        .getPublicUrl(fileName);

      if (publicData?.publicUrl) {
        setCapaUrl(publicData.publicUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha no upload";
      alert(`Erro no upload: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !slug.trim()) {
      setError("Nome e slug da coluna são obrigatórios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/colunas/${coluna?.id}` : "/api/colunas";
      const method = isEditing ? "PUT" : "POST";

      const payload: Record<string, unknown> = {
        nome: nome.trim(),
        slug: slug.trim(),
        cidade_id: cidadeId || null,
        descricao: descricao.trim() || null,
        capa_url: capaUrl || null,
        aceita_anuncios: aceitaAnuncios,
      };

      if (userRole === "admin") {
        payload.status = status;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar coluna.");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar coluna.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Columns className="w-5 h-5 text-primary" />
            {isEditing ? "Editar Coluna" : "Criar Nova Coluna"}
          </DialogTitle>
          <DialogDescription>
            Configure sua coluna municipal ou temática. Colunistas têm espaço de destaque e monetização exclusiva.
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
              <Label htmlFor="col_nome">Nome da Coluna *</Label>
              <Input
                id="col_nome"
                placeholder="Ex: Cotia em Foco, Bastidores da Política"
                value={nome}
                onChange={handleNomeChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="col_slug">Slug (URL amigável) *</Label>
              <Input
                id="col_slug"
                placeholder="cotia-em-foco"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="col_cidade">Cidade de Referência (Opcional)</Label>
            <select
              id="col_cidade"
              value={cidadeId}
              onChange={(e) => setCidadeId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Geral / Sem cidade específica</option>
              {cidades.map((cid) => (
                <option key={cid.id} value={cid.id}>
                  {cid.nome} - {cid.uf}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="col_desc">Descrição / Linha Editorial</Label>
            <Textarea
              id="col_desc"
              placeholder="Apresente sua coluna e os temas que aborda para os leitores..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-[11px] text-slate-400 text-right">
              {descricao.length}/500 caracteres
            </p>
          </div>

          {/* Imagem de Capa / Banner */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Label className="text-xs font-semibold">Capa ou Banner da Coluna</Label>
            <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {capaUrl ? (
                <Image
                  src={capaUrl}
                  alt="Capa da Coluna"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span className="text-xs">Nenhum banner selecionado</span>
                </div>
              )}
            </div>

            <Label
              htmlFor="upload-capa-coluna"
              className="w-full inline-flex items-center justify-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {isUploading ? "Enviando Capa..." : "Fazer Upload de Capa"}
            </Label>
            <input
              id="upload-capa-coluna"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadCapa}
              disabled={isUploading}
            />
          </div>

          {/* Opções e Status */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-semibold text-sm">Aceita Anúncios Locais</Label>
                <p className="text-xs text-slate-500">
                  Habilita espaços de publicidade e split de pagamento na sua coluna.
                </p>
              </div>
              <Switch checked={aceitaAnuncios} onCheckedChange={setAceitaAnuncios} />
            </div>

            {userRole === "admin" && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <Label htmlFor="admin_status">Status da Coluna (Admin)</Label>
                <select
                  id="admin_status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "pendente" | "ativa" | "suspensa")}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-medium"
                >
                  <option value="ativa">Ativa (Aprovada e visível)</option>
                  <option value="pendente">Pendente (Aguardando moderação)</option>
                  <option value="suspensa">Suspensa (Oculta temporariamente)</option>
                </select>
              </div>
            )}
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
                "Criar Coluna"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
