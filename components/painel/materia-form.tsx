"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { slugify } from "@/lib/utils/slugify";
import { createClient } from "@/lib/supabase/client";
import { TiptapEditor } from "./tiptap-editor";
import type { CategoriaData, CidadeData, MateriaData, ColunaData } from "@/lib/portal/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Upload,
  Loader2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Eye,
  Calendar,
  Tag,
  Columns,
} from "lucide-react";

const materiaFormSchema = z.object({
  titulo: z.string().min(5, "O título deve ter no mínimo 5 caracteres"),
  slug: z.string().min(3, "Slug inválido"),
  subtitulo: z.string().optional(),
  resumo: z.string().min(10, "O resumo deve ter no mínimo 10 caracteres"),
  categoria_id: z.string().uuid("Selecione uma editoria"),
  cidade_id: z.string().optional(),
  coluna_id: z.string().optional(),
  imagem_url: z.string().optional(),
  imagem_credito: z.string().optional(),
  status: z.enum(["rascunho", "publicado", "despublicado", "agendado"]),
  publicado_em: z.string().optional(),
  urgente: z.boolean().default(false),
  destaque: z.boolean().default(false),
  seo_titulo: z.string().optional(),
  seo_descricao: z.string().optional(),
});

type MateriaFormData = z.infer<typeof materiaFormSchema>;

interface MateriaFormProps {
  initialMateria?: MateriaData | null;
  categorias: CategoriaData[];
  cidades: CidadeData[];
  colunas?: ColunaData[];
  userId: string;
  userRole: string;
}

export function MateriaForm({
  initialMateria,
  categorias,
  cidades,
  colunas = [],
  userId,
  userRole,
}: MateriaFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialMateria?.id);

  const [conteudoHtml, setConteudoHtml] = useState<string>(
    initialMateria?.conteudo_html || ""
  );
  const [conteudoJson, setConteudoJson] = useState<unknown>(
    initialMateria?.conteudo || null
  );
  const [imagemDestaque, setImagemDestaque] = useState<string>(
    initialMateria?.imagem_url || ""
  );
  const [isUploadingDestaque, setIsUploadingDestaque] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialMateria?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MateriaFormData>({
    resolver: zodResolver(materiaFormSchema),
    defaultValues: {
      titulo: initialMateria?.titulo || "",
      slug: initialMateria?.slug || "",
      subtitulo: initialMateria?.subtitulo || "",
      resumo: initialMateria?.resumo || "",
      categoria_id: initialMateria?.categoria_id || (categorias[0]?.id || ""),
      cidade_id: initialMateria?.cidade_id || "",
      coluna_id: initialMateria?.coluna_id || (userRole === "colunista" ? colunas[0]?.id || "" : ""),
      imagem_url: initialMateria?.imagem_url || "",
      imagem_credito: initialMateria?.imagem_credito || "",
      status: initialMateria?.status || "rascunho",
      publicado_em: initialMateria?.publicado_em
        ? new Date(initialMateria.publicado_em).toISOString().slice(0, 16)
        : "",
      urgente: initialMateria?.urgente || false,
      destaque: initialMateria?.destaque || false,
      seo_titulo: initialMateria?.seo_titulo || "",
      seo_descricao: initialMateria?.seo_descricao || "",
    },
  });

  const watchStatus = watch("status");

  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("titulo", val);
    if (!isEditing) {
      setValue("slug", slugify(val));
    }
  };

  const handleUploadDestaque = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem não pode ultrapassar 5MB.");
      return;
    }

    setIsUploadingDestaque(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop() || "webp";
      const fileName = `${userId}/destaque-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("materias")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("materias")
        .getPublicUrl(fileName);

      if (publicData?.publicUrl) {
        setImagemDestaque(publicData.publicUrl);
        setValue("imagem_url", publicData.publicUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha no upload";
      alert(`Erro no upload da imagem: ${msg}`);
    } finally {
      setIsUploadingDestaque(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const onSubmit = async (data: MateriaFormData) => {
    setIsSaving(true);
    setFeedback(null);

    const payload = {
      ...data,
      cidade_id: data.cidade_id || null,
      coluna_id: data.coluna_id || null,
      imagem_url: imagemDestaque || null,
      conteudo: conteudoJson,
      conteudo_html: conteudoHtml,
      tags,
      publicado_em: data.publicado_em
        ? new Date(data.publicado_em).toISOString()
        : (isEditing && initialMateria?.publicado_em ? initialMateria.publicado_em : null),
    };

    try {
      const url = isEditing
        ? `/api/materias/${initialMateria!.id}`
        : "/api/materias";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Erro ao salvar matéria.");
      }

      setFeedback({
        type: "success",
        message: isEditing
          ? "Matéria atualizada com sucesso!"
          : "Matéria criada com sucesso!",
      });

      setTimeout(() => {
        if (userRole === "colunista") {
          router.push("/painel/colunista/artigos");
        } else if (userRole === "admin") {
          router.push("/painel/admin/materias");
        } else {
          router.push("/painel/editor/materias");
        }
        router.refresh();
      }, 1000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro na gravação";
      setFeedback({ type: "error", message: msg });
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Topo */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 text-xs text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>

        {isEditing && initialMateria?.slug && (
          <a
            href={`/materia/${initialMateria.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <Eye className="w-4 h-4" /> Ver no Portal
          </a>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Principal: Editor e Textos (8 colunas) */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conteúdo da Notícia</CardTitle>
                <CardDescription>
                  Escreva e formate a matéria com texto rico, imagens e vídeos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título da Notícia (Manchete)</Label>
                  <Input
                    id="titulo"
                    placeholder="Digite uma manchete atraente e objetiva..."
                    className="mt-1 font-bold text-base"
                    {...register("titulo", { onChange: handleTituloChange })}
                  />
                  {errors.titulo && (
                    <p className="text-xs text-destructive mt-1">{errors.titulo.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subtitulo">Subtítulo / Linha Fina (Opcional)</Label>
                  <Input
                    id="subtitulo"
                    placeholder="Resumo complementar que aparece abaixo do título..."
                    className="mt-1"
                    {...register("subtitulo")}
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug / URL da Notícia</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 font-mono">/materia/</span>
                    <Input id="slug" className="font-mono text-xs" {...register("slug")} />
                  </div>
                  {errors.slug && (
                    <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="resumo">Resumo / Lead (Exibido nos Cards e Feeds)</Label>
                  <Textarea
                    id="resumo"
                    rows={3}
                    placeholder="Resumo curto de até ~300 caracteres que contextualiza os fatos..."
                    className="mt-1"
                    {...register("resumo")}
                  />
                  {errors.resumo && (
                    <p className="text-xs text-destructive mt-1">{errors.resumo.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Label className="mb-2 block">Corpo da Matéria (Editor Rico)</Label>
                  <TiptapEditor
                    contentHtml={conteudoHtml}
                    onChange={(html, json) => {
                      setConteudoHtml(html);
                      setConteudoJson(json);
                    }}
                    userId={userId}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Otimização de SEO */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SEO & Motores de Busca</CardTitle>
                <CardDescription>
                  Personalize títulos e descrições para ranquear melhor no Google.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seo_titulo">Título SEO (Opcional)</Label>
                  <Input
                    id="seo_titulo"
                    placeholder="Ex.: Notícia Urgente de São Paulo | Portal Empire"
                    className="mt-1"
                    {...register("seo_titulo")}
                  />
                </div>

                <div>
                  <Label htmlFor="seo_descricao">Meta Descrição (Opcional)</Label>
                  <Textarea
                    id="seo_descricao"
                    rows={2}
                    placeholder="Descrição otimizada para o Google (máx. ~160 caracteres)..."
                    className="mt-1"
                    {...register("seo_descricao")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral: Metadados, Imagem e Publicação (4 colunas) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Publicação & Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status & Publicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status da Matéria</Label>
                  <Select id="status" className="mt-1" {...register("status")}>
                    <option value="rascunho">Rascunho</option>
                    <option value="publicado">Publicar Imediatamente</option>
                    <option value="agendado">Agendar Publicação</option>
                    <option value="despublicado">Despublicar</option>
                  </Select>
                </div>

                {watchStatus === "agendado" && (
                  <div>
                    <Label htmlFor="publicado_em" className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Data e Hora de Publicação
                    </Label>
                    <Input
                      id="publicado_em"
                      type="datetime-local"
                      className="mt-1 text-xs"
                      {...register("publicado_em")}
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      {...register("destaque")}
                    />
                    <span>Marcar como Destaque Principal</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-4 w-4"
                      {...register("urgente")}
                    />
                    <span className="text-red-600 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Notícia Urgente (Ticker)
                    </span>
                  </label>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full mt-4">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando Matéria...
                    </>
                  ) : isEditing ? (
                    "Atualizar Matéria"
                  ) : (
                    "Salvar e Continuar"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Imagem de Destaque */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Imagem de Capa</CardTitle>
                <CardDescription>
                  Foto principal exibida no topo da matéria e nos cards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  {imagemDestaque ? (
                    <Image
                      src={imagemDestaque}
                      alt="Capa"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-xs">Nenhuma foto selecionada</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="upload-capa"
                    className="w-full inline-flex items-center justify-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {isUploadingDestaque ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    {isUploadingDestaque ? "Enviando Imagem..." : "Fazer Upload de Capa"}
                  </Label>
                  <input
                    id="upload-capa"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadDestaque}
                    disabled={isUploadingDestaque}
                  />

                  <div>
                    <Label htmlFor="imagem_credito" className="text-xs">
                      Créditos da Foto
                    </Label>
                    <Input
                      id="imagem_credito"
                      placeholder="Ex.: Foto: Agência Brasil / João Silva"
                      className="mt-1 text-xs"
                      {...register("imagem_credito")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Editoria e Cidade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Classificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Seletor de Coluna para Colunistas ou Admin */}
                {(userRole === "colunista" || colunas.length > 0) && (
                  <div>
                    <Label htmlFor="coluna_id" className="flex items-center gap-1.5 font-semibold text-xs">
                      <Columns className="w-3.5 h-3.5 text-primary" /> Coluna do Artigo {userRole === "colunista" ? "*" : "(Opcional)"}
                    </Label>
                    {userRole === "colunista" && colunas.length === 0 ? (
                      <div className="p-3 mt-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                        Você não possui nenhuma coluna <strong>ativa</strong> no momento. Acesse &quot;Minhas Colunas&quot; para cadastrar ou aguardar aprovação antes de publicar artigos.
                      </div>
                    ) : (
                      <Select id="coluna_id" className="mt-1" {...register("coluna_id")}>
                        {userRole !== "colunista" && <option value="">Nenhuma (Matéria de Editoria Geral)</option>}
                        {colunas.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.nome} {col.cidade ? `(${col.cidade.nome})` : ""}
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="categoria_id">Editoria (Categoria)</Label>
                  <Select id="categoria_id" className="mt-1" {...register("categoria_id")}>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                  </Select>
                  {errors.categoria_id && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.categoria_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cidade_id">Cidade (Opcional)</Label>
                  <Select id="cidade_id" className="mt-1" {...register("cidade_id")}>
                    <option value="">Geral / Sem cidade específica</option>
                    {cidades.map((cid) => (
                      <option key={cid.id} value={cid.id}>
                        {cid.nome} - {cid.uf}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Tags */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Label htmlFor="tag-input" className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Tags da Matéria
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="tag-input"
                      placeholder="Adicione tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                    >
                      +
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-destructive font-bold text-xs ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
