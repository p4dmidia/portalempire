"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2, Upload, User, Lock } from "lucide-react";
import Image from "next/image";

const perfilSchema = z.object({
  nome: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  telefone: z.string().optional(),
  cpf_cnpj: z.string().optional(),
  bio: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
});

type PerfilFormData = z.infer<typeof perfilSchema>;

const senhaSchema = z
  .object({
    password: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme a nova senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type SenhaFormData = z.infer<typeof senhaSchema>;

export function PerfilForm({ initialProfile }: { initialProfile: Profile }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const redes = profile.redes_sociais || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: profile.nome,
      telefone: profile.telefone || "",
      cpf_cnpj: profile.cpf_cnpj || "",
      bio: profile.bio || "",
      instagram: redes.instagram || "",
      facebook: redes.facebook || "",
      twitter: redes.twitter || "",
      youtube: redes.youtube || "",
      linkedin: redes.linkedin || "",
      website: redes.website || "",
    },
  });

  const {
    register: registerSenha,
    handleSubmit: handleSubmitSenha,
    reset: resetSenha,
    formState: { errors: errorsSenha },
  } = useForm<SenhaFormData>({
    resolver: zodResolver(senhaSchema),
  });

  const onSubmitPerfil = async (data: PerfilFormData) => {
    setIsSaving(true);
    setFeedback(null);

    const supabase = createClient();
    const updatedRedes = {
      instagram: data.instagram || undefined,
      facebook: data.facebook || undefined,
      twitter: data.twitter || undefined,
      youtube: data.youtube || undefined,
      linkedin: data.linkedin || undefined,
      website: data.website || undefined,
    };

    const { error } = await supabase
      .from("profiles")
      .update({
        nome: data.nome,
        telefone: data.telefone || null,
        cpf_cnpj: data.cpf_cnpj || null,
        bio: data.bio || null,
        redes_sociais: updatedRedes,
      })
      .eq("id", profile.id);

    if (error) {
      setFeedback({ type: "error", message: `Erro ao salvar: ${error.message}` });
      setIsSaving(false);
      return;
    }

    setFeedback({ type: "success", message: "Perfil atualizado com sucesso!" });
    setIsSaving(false);
    router.refresh();
  };

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", message: "A foto deve ter no máximo 5MB." });
      return;
    }

    setIsUploadingPhoto(true);
    setFeedback(null);

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("perfis")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setFeedback({ type: "error", message: `Erro no upload da foto: ${uploadError.message}` });
      setIsUploadingPhoto(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("perfis")
      .getPublicUrl(fileName);

    const fotoUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ foto_url: fotoUrl })
      .eq("id", profile.id);

    if (updateError) {
      setFeedback({ type: "error", message: `Erro ao salvar URL da foto: ${updateError.message}` });
      setIsUploadingPhoto(false);
      return;
    }

    setProfile((prev) => ({ ...prev, foto_url: fotoUrl }));
    setFeedback({ type: "success", message: "Foto de perfil atualizada!" });
    setIsUploadingPhoto(false);
    router.refresh();
  };

  const onSubmitSenha = async (data: SenhaFormData) => {
    setIsChangingPassword(true);
    setPasswordFeedback(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setPasswordFeedback({ type: "error", message: `Erro ao trocar senha: ${error.message}` });
      setIsChangingPassword(false);
      return;
    }

    setPasswordFeedback({ type: "success", message: "Senha alterada com sucesso!" });
    resetSenha();
    setIsChangingPassword(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Meu Perfil
        </h1>
        <p className="text-sm text-slate-500">
          Gerencie suas informações públicas, dados de contato e segurança da conta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da Foto e Resumo */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Foto e Permissões</CardTitle>
              <CardDescription>Sua identidade no portal</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {profile.foto_url ? (
                  <Image
                    src={profile.foto_url}
                    alt={profile.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
              </div>

              <div>
                <Label
                  htmlFor="upload-foto"
                  className="inline-flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {isUploadingPhoto ? "Enviando..." : "Alterar Foto"}
                </Label>
                <input
                  id="upload-foto"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadFoto}
                  disabled={isUploadingPhoto}
                />
              </div>

              <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-left text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nível de Acesso:</span>
                  <Badge variant="default" className="uppercase text-[10px]">
                    {profile.role}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status da Conta:</span>
                  <Badge variant="success" className="uppercase text-[10px]">
                    {profile.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">URL Pública:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    /autor/{profile.slug}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna do Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais & Redes Sociais</CardTitle>
              <CardDescription>
                Informações exibidas nas suas matérias e colunas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedback && (
                <div
                  className={`mb-6 p-3 rounded-lg text-sm flex items-center gap-2 ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmitPerfil)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" className="mt-1" {...register("nome")} />
                    {errors.nome && (
                      <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail (Não editável)</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="mt-1 bg-slate-50 dark:bg-slate-800 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                    <Input id="telefone" placeholder="(11) 99999-9999" className="mt-1" {...register("telefone")} />
                  </div>

                  <div>
                    <Label htmlFor="cpf_cnpj">CPF ou CNPJ (para repasses)</Label>
                    <Input id="cpf_cnpj" placeholder="000.000.000-00" className="mt-1" {...register("cpf_cnpj")} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biografia / Sobre Você</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    placeholder="Escreva um breve resumo da sua trajetória profissional e cobertura regional..."
                    className="mt-1"
                    {...register("bio")}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-semibold mb-3">Redes Sociais & Links</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input id="instagram" placeholder="https://instagram.com/usuario" className="mt-1" {...register("instagram")} />
                    </div>

                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input id="facebook" placeholder="https://facebook.com/usuario" className="mt-1" {...register("facebook")} />
                    </div>

                    <div>
                      <Label htmlFor="twitter">X / Twitter</Label>
                      <Input id="twitter" placeholder="https://x.com/usuario" className="mt-1" {...register("twitter")} />
                    </div>

                    <div>
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input id="youtube" placeholder="https://youtube.com/@canal" className="mt-1" {...register("youtube")} />
                    </div>

                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input id="linkedin" placeholder="https://linkedin.com/in/usuario" className="mt-1" {...register("linkedin")} />
                    </div>

                    <div>
                      <Label htmlFor="website">Site Pessoal / Blog</Label>
                      <Input id="website" placeholder="https://meusite.com.br" className="mt-1" {...register("website")} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando Alterações...
                      </>
                    ) : (
                      "Salvar Perfil"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Troca de Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Segurança & Senha
              </CardTitle>
              <CardDescription>
                Altere sua senha de acesso ao portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordFeedback && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                    passwordFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {passwordFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmitSenha(onSubmitSenha)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="mt-1"
                      {...registerSenha("password")}
                    />
                    {errorsSenha.password && (
                      <p className="text-xs text-destructive mt-1">
                        {errorsSenha.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="mt-1"
                      {...registerSenha("confirmPassword")}
                    />
                    {errorsSenha.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">
                        {errorsSenha.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="outline" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Atualizando Senha...
                      </>
                    ) : (
                      "Atualizar Senha"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
