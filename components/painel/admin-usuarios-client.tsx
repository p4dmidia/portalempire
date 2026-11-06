"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile, UserRole, UserStatus } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Ban,
  Loader2,
  UserCheck,
  AlertCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Pencil,
  Phone,
  Instagram,
  MapPin,
  ExternalLink,
  Mail,
  Shield,
  FileText,
  Calendar,
  Sparkles,
  Trash2,
  Lock,
  Building2,
} from "lucide-react";
import Image from "next/image";
import { formatarDataCurta } from "@/lib/utils/date-format";

const UFS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

function checkPasswordStrength(password: string) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

function generateSecurePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%&*";

  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];

  return `${pick(upper)}${pick(lower)}${pick(numbers)}${pick(symbols)}${pick(upper)}${pick(lower)}${pick(numbers)}${pick(symbols)}`;
}

function maskCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

async function fetchViaCep(cepRaw: string): Promise<{
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  erro?: boolean;
} | null> {
  const clean = cepRaw.replace(/\D/g, "");
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return { erro: true };
    return {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      uf: data.uf || "",
    };
  } catch {
    return null;
  }
}

interface AdminUsuariosClientProps {
  initialProfiles: Profile[];
  currentAdminId: string;
}

export function AdminUsuariosClient({
  initialProfiles,
  currentAdminId,
}: AdminUsuariosClientProps) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Estado para Formulário de Cadastro Direto de Usuário
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteNome, setInviteNome] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSenha, setInviteSenha] = useState("");
  const [inviteConfirmarSenha, setInviteConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [inviteRole, setInviteRole] = useState<UserRole>("colunista");
  const [inviteTelefone, setInviteTelefone] = useState("");
  const [inviteInstagram, setInviteInstagram] = useState("");

  // Endereço completo no cadastro
  const [inviteCep, setInviteCep] = useState("");
  const [inviteLogradouro, setInviteLogradouro] = useState("");
  const [inviteNumero, setInviteNumero] = useState("");
  const [inviteComplemento, setInviteComplemento] = useState("");
  const [inviteBairro, setInviteBairro] = useState("");
  const [inviteCidade, setInviteCidade] = useState("");
  const [inviteUf, setInviteUf] = useState("");
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepNotice, setCepNotice] = useState<string | null>(null);

  const [inviteBio, setInviteBio] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ nome: string; email: string; pass: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Estado para Visualização de Dados do Colunista / Usuário
  const [viewUser, setViewUser] = useState<Profile | null>(null);

  // Estado para Edição Completa de Dados do Colunista / Usuário
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("colunista");
  const [editStatus, setEditStatus] = useState<UserStatus>("ativo");
  const [editTelefone, setEditTelefone] = useState("");
  const [editInstagram, setEditInstagram] = useState("");

  // Endereço completo na edição
  const [editCep, setEditCep] = useState("");
  const [editLogradouro, setEditLogradouro] = useState("");
  const [editNumero, setEditNumero] = useState("");
  const [editComplemento, setEditComplemento] = useState("");
  const [editBairro, setEditBairro] = useState("");
  const [editCidade, setEditCidade] = useState("");
  const [editUf, setEditUf] = useState("");
  const [isSearchingEditCep, setIsSearchingEditCep] = useState(false);
  const [editCepNotice, setEditCepNotice] = useState<string | null>(null);

  const [editBio, setEditBio] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Estado para Confirmação de Exclusão de Cadastro
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Validação de senha em tempo real
  const passChecks = checkPasswordStrength(inviteSenha);
  const passwordsMatch = inviteSenha.length > 0 && inviteSenha === inviteConfirmarSenha;
  const isPasswordValid =
    passChecks.minLength &&
    passChecks.hasUpper &&
    passChecks.hasNumber &&
    passChecks.hasSpecial &&
    passwordsMatch;

  // Filtragem
  const filteredProfiles = profiles.filter((p) => {
    const redes = p.redes_sociais || {};
    const dadosEnd = (redes.dados_endereco as Record<string, string>) || {};
    const matchesSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.telefone && p.telefone.toLowerCase().includes(search.toLowerCase())) ||
      (redes.instagram && (redes.instagram as string).toLowerCase().includes(search.toLowerCase())) ||
      (redes.endereco && (redes.endereco as string).toLowerCase().includes(search.toLowerCase())) ||
      (p.endereco && p.endereco.toLowerCase().includes(search.toLowerCase())) ||
      (p.cidade && p.cidade.toLowerCase().includes(search.toLowerCase())) ||
      (dadosEnd.cidade && dadosEnd.cidade.toLowerCase().includes(search.toLowerCase())) ||
      (p.uf && p.uf.toLowerCase().includes(search.toLowerCase())) ||
      (dadosEnd.uf && dadosEnd.uf.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = filterRole === "todos" || p.role === filterRole;
    const matchesStatus = filterStatus === "todos" || p.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAction = async (
    targetUserId: string,
    action: "aprovar" | "bloquear" | "ativar" | "alterar_role",
    newRole?: UserRole
  ) => {
    setLoadingActionId(targetUserId);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action, newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao executar ação.");
      }

      setFeedback({ type: "success", message: data.message });

      // Atualiza o estado local
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== targetUserId) return p;
          if (action === "aprovar" || action === "ativar") return { ...p, status: "ativo" };
          if (action === "bloquear") return { ...p, status: "bloqueado" };
          if (action === "alterar_role" && newRole) return { ...p, role: newRole };
          return p;
        })
      );
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro na operação";
      setFeedback({ type: "error", message });
    } finally {
      setLoadingActionId(null);
    }
  };

  // Gerar senha forte automática
  const handleGeneratePassword = () => {
    const newPass = generateSecurePassword();
    setInviteSenha(newPass);
    setInviteConfirmarSenha(newPass);
    setShowSenha(true);
    setShowConfirmarSenha(true);
  };

  // Buscar CEP no cadastro
  const handleBuscarCepCadastro = async (cepRaw?: string) => {
    const cepAlvo = cepRaw || inviteCep;
    const clean = cepAlvo.replace(/\D/g, "");
    if (clean.length !== 8) {
      setCepNotice("Digite os 8 dígitos do CEP para buscar.");
      return;
    }
    setIsSearchingCep(true);
    setCepNotice(null);
    try {
      const data = await fetchViaCep(clean);
      if (!data || data.erro) {
        setCepNotice("CEP não encontrado no ViaCEP. Você pode preencher os campos abaixo manualmente.");
      } else {
        if (data.logradouro) setInviteLogradouro(data.logradouro);
        if (data.bairro) setInviteBairro(data.bairro);
        if (data.cidade) setInviteCidade(data.cidade);
        if (data.uf) setInviteUf(data.uf.toUpperCase());
        setCepNotice(null);
      }
    } catch {
      setCepNotice("Não foi possível consultar o CEP no momento. Preencha manualmente.");
    } finally {
      setIsSearchingCep(false);
    }
  };

  // Buscar CEP na edição
  const handleBuscarCepEdit = async (cepRaw?: string) => {
    const cepAlvo = cepRaw || editCep;
    const clean = cepAlvo.replace(/\D/g, "");
    if (clean.length !== 8) {
      setEditCepNotice("Digite os 8 dígitos do CEP para buscar.");
      return;
    }
    setIsSearchingEditCep(true);
    setEditCepNotice(null);
    try {
      const data = await fetchViaCep(clean);
      if (!data || data.erro) {
        setEditCepNotice("CEP não encontrado. Você pode preencher os campos manualmente.");
      } else {
        if (data.logradouro) setEditLogradouro(data.logradouro);
        if (data.bairro) setEditBairro(data.bairro);
        if (data.cidade) setEditCidade(data.cidade);
        if (data.uf) setEditUf(data.uf.toUpperCase());
        setEditCepNotice(null);
      }
    } catch {
      setEditCepNotice("Não foi possível consultar o CEP. Preencha manualmente.");
    } finally {
      setIsSearchingEditCep(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setFeedback({
        type: "error",
        message: "A senha não atende aos requisitos obrigatórios ou a confirmação não confere.",
      });
      return;
    }

    setIsInviting(true);
    setFeedback(null);
    setCreatedCreds(null);

    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cadastrar",
          nome: inviteNome,
          email: inviteEmail,
          senha: inviteSenha,
          confirmarSenha: inviteConfirmarSenha,
          role: inviteRole,
          telefone: inviteTelefone,
          instagram: inviteInstagram,
          cep: inviteCep,
          logradouro: inviteLogradouro,
          numero: inviteNumero,
          complemento: inviteComplemento,
          bairro: inviteBairro,
          cidade: inviteCidade,
          uf: inviteUf,
          bio: inviteBio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar usuário.");
      }

      setCreatedCreds({
        nome: inviteNome,
        email: data.email || inviteEmail,
        pass: data.senha || inviteSenha,
      });
      setFeedback({ type: "success", message: "Usuário cadastrado com sucesso no sistema!" });
      
      // Limpar campos
      setInviteNome("");
      setInviteEmail("");
      setInviteSenha("");
      setInviteConfirmarSenha("");
      setInviteTelefone("");
      setInviteInstagram("");
      setInviteCep("");
      setInviteLogradouro("");
      setInviteNumero("");
      setInviteComplemento("");
      setInviteBairro("");
      setInviteCidade("");
      setInviteUf("");
      setInviteBio("");
      setCepNotice(null);
      
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar";
      setFeedback({ type: "error", message });
    } finally {
      setIsInviting(false);
    }
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (user: Profile) => {
    setEditUser(user);
    setEditNome(user.nome || "");
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditTelefone(user.telefone || (user.redes_sociais?.whatsapp as string) || "");
    setEditInstagram((user.redes_sociais?.instagram as string) || "");
    setEditBio(user.bio || "");

    const dadosEnd = (user.redes_sociais?.dados_endereco as Record<string, string>) || {};
    setEditCep(user.cep || dadosEnd.cep || "");
    setEditLogradouro(dadosEnd.logradouro || user.endereco || (user.redes_sociais?.endereco as string) || "");
    setEditNumero(dadosEnd.numero || "");
    setEditComplemento(dadosEnd.complemento || "");
    setEditBairro(dadosEnd.bairro || "");
    setEditCidade(user.cidade || dadosEnd.cidade || "");
    setEditUf(user.uf || dadosEnd.uf || "");
    setEditCepNotice(null);
  };

  // Salvar Edição Completa
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    setIsSavingEdit(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "editar_perfil",
          targetUserId: editUser.id,
          nome: editNome,
          role: editRole,
          status: editStatus,
          telefone: editTelefone,
          instagram: editInstagram,
          cep: editCep,
          logradouro: editLogradouro,
          numero: editNumero,
          complemento: editComplemento,
          bairro: editBairro,
          cidade: editCidade,
          uf: editUf,
          bio: editBio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar informações.");
      }

      setFeedback({ type: "success", message: "Informações do usuário atualizadas com sucesso!" });

      // Atualiza estado local
      const cleanInsta = editInstagram ? editInstagram.replace(/^@/, "").trim() : "";
      const enderecoSalvo = data.endereco || editLogradouro;
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== editUser.id) return p;
          const redesAtuais = { ...(p.redes_sociais || {}) };
          if (cleanInsta) redesAtuais.instagram = cleanInsta;
          else delete redesAtuais.instagram;
          if (enderecoSalvo) redesAtuais.endereco = enderecoSalvo;
          if (editTelefone.trim()) redesAtuais.whatsapp = editTelefone.trim();
          redesAtuais.dados_endereco = {
            cep: editCep,
            logradouro: editLogradouro,
            numero: editNumero,
            complemento: editComplemento,
            bairro: editBairro,
            cidade: editCidade,
            uf: editUf,
          };

          return {
            ...p,
            nome: editNome.trim(),
            role: editRole,
            status: editStatus,
            telefone: editTelefone.trim() || null,
            endereco: enderecoSalvo || null,
            cidade: editCidade.trim() || null,
            uf: editUf.trim() || null,
            cep: editCep.trim() || null,
            bio: editBio.trim() || null,
            redes_sociais: redesAtuais,
          };
        })
      );

      // Se estava vendo o perfil, atualiza também
      if (viewUser && viewUser.id === editUser.id) {
        setViewUser((prev) =>
          prev
            ? {
                ...prev,
                nome: editNome.trim(),
                role: editRole,
                status: editStatus,
                telefone: editTelefone.trim() || null,
                endereco: enderecoSalvo || null,
                cidade: editCidade.trim() || null,
                uf: editUf.trim() || null,
                cep: editCep.trim() || null,
                bio: editBio.trim() || null,
              }
            : null
        );
      }

      setEditUser(null);
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar";
      setFeedback({ type: "error", message });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Exclusão de Cadastro
  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;
    setIsDeleting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "excluir",
          targetUserId: deleteConfirmUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir usuário.");
      }

      setFeedback({ type: "success", message: "Cadastro do usuário excluído com sucesso!" });

      // Remove do estado local
      setProfiles((prev) => prev.filter((p) => p.id !== deleteConfirmUser.id));

      if (viewUser && viewUser.id === deleteConfirmUser.id) {
        setViewUser(null);
      }

      setDeleteConfirmUser(null);
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao excluir";
      setFeedback({ type: "error", message });
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roleColors: Record<UserRole, "default" | "secondary" | "success" | "warning"> = {
    admin: "default",
    editor: "secondary",
    colunista: "warning",
    anunciante: "success",
  };

  const statusColors: Record<UserStatus, "success" | "warning" | "destructive"> = {
    ativo: "success",
    pendente: "warning",
    bloqueado: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Gestão de Usuários e Equipe
          </h1>
          <p className="text-sm text-slate-500">
            Aprovação de colunistas, controle de acessos, dados cadastrais e alteração de permissões.
          </p>
        </div>

        <Button
          onClick={() => {
            setIsInviteOpen(!isInviteOpen);
            setCreatedCreds(null);
          }}
          className="gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          {isInviteOpen ? "Fechar Cadastro" : "+ Cadastrar Novo Usuário"}
        </Button>
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

      {/* Formulário de Cadastro Direto de Usuário */}
      {isInviteOpen && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Cadastrar Novo Usuário / Membro da Equipe
            </CardTitle>
            <CardDescription>
              Cadastre o colunista ou membro da equipe diretamente. Nenhum e-mail é disparado; as credenciais são geradas e exibidas aqui para você copiar e enviar via WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {createdCreds ? (
              <div className="p-5 bg-white dark:bg-slate-900 border-2 border-emerald-500/30 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  Usuário cadastrado com sucesso!
                </div>
                <p className="text-xs text-slate-500">
                  A conta foi criada diretamente e já está pronta para uso (nenhum e-mail foi disparado). Copie as credenciais de acesso abaixo para enviar ao usuário:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block font-sans text-[11px]">E-mail de Login:</span>
                    <span className="font-bold text-slate-900 dark:text-white select-all text-sm">{createdCreds.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans text-[11px]">Senha de Acesso:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 select-all text-sm">{createdCreds.pass}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`E-mail: ${createdCreds.email}\nSenha: ${createdCreds.pass}`)}
                    className="gap-1.5 text-xs"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Dados Copiados!" : "Copiar E-mail e Senha"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`Olá ${createdCreds.nome}, seu acesso ao Portal Empire Cidades foi criado!\n\nLink: https://www.empirecidades.com.br/login\nE-mail: ${createdCreds.email}\nSenha: ${createdCreds.pass}`)}
                    className="gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    Copiar Mensagem para WhatsApp
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCreatedCreds(null);
                    }}
                    className="text-xs ml-auto text-primary font-semibold hover:underline"
                  >
                    + Cadastrar Outro Usuário
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCadastro} className="space-y-6">
                {/* 1. DADOS DE IDENTIFICAÇÃO */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" /> Identificação e Contato
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="invite-nome">Nome Completo *</Label>
                      <Input
                        id="invite-nome"
                        required
                        placeholder="Ex: João da Silva"
                        value={inviteNome}
                        onChange={(e) => setInviteNome(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="invite-email">E-mail de Login *</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        required
                        placeholder="email@exemplo.com.br"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="invite-role">Nível de Acesso (Role) *</Label>
                      <Select
                        id="invite-role"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as UserRole)}
                        className="mt-1"
                      >
                        <option value="colunista">Colunista</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Administrador</option>
                        <option value="anunciante">Anunciante</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="invite-telefone">Telefone / WhatsApp</Label>
                      <Input
                        id="invite-telefone"
                        placeholder="(11) 99999-9999"
                        value={inviteTelefone}
                        onChange={(e) => setInviteTelefone(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="invite-instagram">Instagram (@usuario ou link)</Label>
                      <Input
                        id="invite-instagram"
                        placeholder="@joaosilva"
                        value={inviteInstagram}
                        onChange={(e) => setInviteInstagram(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. SENHA OBRIGATÓRIA & CONFIRMAÇÃO */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-primary" /> Senha de Acesso (Obrigatória) *
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Defina uma senha segura para o usuário acessar o painel.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePassword}
                      className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 shrink-0 self-start sm:self-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Gerar Senha Segura
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="invite-senha">Senha *</Label>
                      <div className="relative mt-1">
                        <Input
                          id="invite-senha"
                          type={showSenha ? "text" : "password"}
                          required
                          placeholder="Mínimo 8 caracteres"
                          value={inviteSenha}
                          onChange={(e) => setInviteSenha(e.target.value)}
                          className="pr-10 font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSenha(!showSenha)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          tabIndex={-1}
                        >
                          {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="invite-confirmar-senha">Confirmar Senha *</Label>
                      <div className="relative mt-1">
                        <Input
                          id="invite-confirmar-senha"
                          type={showConfirmarSenha ? "text" : "password"}
                          required
                          placeholder="Repita a senha digitada"
                          value={inviteConfirmarSenha}
                          onChange={(e) => setInviteConfirmarSenha(e.target.value)}
                          className={`pr-10 font-mono text-sm ${
                            inviteConfirmarSenha && !passwordsMatch
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          tabIndex={-1}
                        >
                          {showConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checklist visual de requisitos de senha */}
                  <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                        passChecks.minLength
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {passChecks.minLength ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                      Mínimo 8 caracteres
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                        passChecks.hasUpper
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {passChecks.hasUpper ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                      1 letra maiúscula (A-Z)
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                        passChecks.hasNumber
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {passChecks.hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                      1 número (0-9)
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                        passChecks.hasSpecial
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {passChecks.hasSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                      1 símbolo especial (!@#$...)
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                        passwordsMatch
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {passwordsMatch ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                      Senhas coincidem
                    </span>
                  </div>
                </div>

                {/* 3. ENDEREÇO COMPLETO COM CEP E AUTO-BUSCA */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-500" /> Endereço Completo & Localização
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Busca automática por CEP ou digitação manual de Cidade/UF
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                    {/* Campo de CEP com busca */}
                    <div className="md:col-span-2">
                      <Label htmlFor="invite-cep">CEP</Label>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Input
                          id="invite-cep"
                          placeholder="00000-000"
                          maxLength={9}
                          value={inviteCep}
                          onChange={(e) => {
                            const val = maskCep(e.target.value);
                            setInviteCep(val);
                            if (val.replace(/\D/g, "").length === 8) {
                              handleBuscarCepCadastro(val);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleBuscarCepCadastro()}
                          disabled={isSearchingCep}
                          className="px-2.5 h-9 shrink-0 gap-1 text-xs"
                          title="Consultar CEP no ViaCEP"
                        >
                          {isSearchingCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">Buscar</span>
                        </Button>
                      </div>
                    </div>

                    {/* Rua / Logradouro */}
                    <div className="md:col-span-4">
                      <Label htmlFor="invite-logradouro">Logradouro / Rua</Label>
                      <Input
                        id="invite-logradouro"
                        placeholder="Ex: Av. Paulista, Rua das Flores..."
                        value={inviteLogradouro}
                        onChange={(e) => setInviteLogradouro(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Número */}
                    <div className="md:col-span-2">
                      <Label htmlFor="invite-numero">Número</Label>
                      <Input
                        id="invite-numero"
                        placeholder="Ex: 327 ou S/N"
                        value={inviteNumero}
                        onChange={(e) => setInviteNumero(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Complemento */}
                    <div className="md:col-span-2">
                      <Label htmlFor="invite-complemento">Complemento (Opcional)</Label>
                      <Input
                        id="invite-complemento"
                        placeholder="Ex: Apto 101, Sala 4..."
                        value={inviteComplemento}
                        onChange={(e) => setInviteComplemento(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Bairro */}
                    <div className="md:col-span-2">
                      <Label htmlFor="invite-bairro">Bairro</Label>
                      <Input
                        id="invite-bairro"
                        placeholder="Ex: Centro, Bela Vista..."
                        value={inviteBairro}
                        onChange={(e) => setInviteBairro(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Cidade */}
                    <div className="md:col-span-4">
                      <Label htmlFor="invite-cidade">Cidade *</Label>
                      <Input
                        id="invite-cidade"
                        placeholder="Ex: Vitória, São Paulo, Belo Horizonte..."
                        value={inviteCidade}
                        onChange={(e) => setInviteCidade(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* UF / Estado */}
                    <div className="md:col-span-2">
                      <Label htmlFor="invite-uf">UF / Estado *</Label>
                      <Select
                        id="invite-uf"
                        value={inviteUf}
                        onChange={(e) => setInviteUf(e.target.value.toUpperCase())}
                        className="mt-1"
                      >
                        <option value="">Selecione a UF</option>
                        {UFS_BRASIL.map((uf) => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {cepNotice && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{cepNotice}</span>
                    </div>
                  )}
                </div>

                {/* 4. BIO / APRESENTAÇÃO */}
                <div>
                  <Label htmlFor="invite-bio">Mini Bio / Apresentação do Colunista (Opcional)</Label>
                  <Textarea
                    id="invite-bio"
                    placeholder="Breve resumo da trajetória ou especialidade do colunista..."
                    value={inviteBio}
                    onChange={(e) => setInviteBio(e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500">
                    {!isPasswordValid && (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Preencha a senha atendendo a todos os critérios para habilitar o cadastro.
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isInviting || !isPasswordValid || !inviteNome.trim() || !inviteEmail.trim()}
                    className="gap-2 min-w-[170px]"
                  >
                    {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {isInviting ? "Cadastrando..." : "Cadastrar Usuário"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabela de Usuários */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Barra de Filtros e Busca */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder="Buscar por nome, e-mail, telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-xs h-9 w-full sm:w-36"
            >
              <option value="todos">Todos os Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="colunista">Colunista</option>
              <option value="anunciante">Anunciante</option>
            </Select>

            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs h-9 w-full sm:w-36"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="pendente">Pendente</option>
              <option value="bloqueado">Bloqueado</option>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-medium text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Usuário</th>
                <th className="px-4 py-4">Contato / Redes</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Cadastrado em</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((user) => {
                  const isSelf = user.id === currentAdminId;
                  const isLoadingThis = loadingActionId === user.id;
                  const redes = (user.redes_sociais || {}) as Record<string, any>;
                  const phoneFormatted: string | null = (user.telefone || redes.whatsapp) || null;
                  const instagramHandle: string | null = redes.instagram || null;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Avatar e Nome */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                            {user.foto_url ? (
                              <Image
                                src={user.foto_url}
                                alt={user.nome}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              user.nome.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {user.nome}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-normal">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contato, Redes e Localização */}
                      <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300">
                        {(() => {
                          const dadosEnd = (user.redes_sociais?.dados_endereco as Record<string, string>) || {};
                          const cid = user.cidade || dadosEnd.cidade;
                          const est = user.uf || dadosEnd.uf;
                          const cidadeUf = cid && est ? `${cid} - ${est}` : (cid || est || null);

                          return (
                            <div className="space-y-1">
                              {phoneFormatted && (
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{phoneFormatted}</span>
                                </div>
                              )}
                              {instagramHandle && (
                                <a
                                  href={`https://instagram.com/${instagramHandle.replace(/^@/, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-pink-600 hover:underline"
                                >
                                  <Instagram className="w-3.5 h-3.5 shrink-0" />
                                  <span>@{instagramHandle.replace(/^@/, "")}</span>
                                </a>
                              )}
                              {cidadeUf && (
                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                                  <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="truncate max-w-[150px]">{cidadeUf}</span>
                                </div>
                              )}
                              {!phoneFormatted && !instagramHandle && !cidadeUf && (
                                <span className="text-slate-400 italic">Sem contato</span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <Badge variant={roleColors[user.role]} className="uppercase text-[10px]">
                          {user.role}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <Badge variant={statusColors[user.status]} className="uppercase text-[10px]">
                          {user.status}
                        </Badge>
                      </td>

                      {/* Data de Criação */}
                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {user.created_at
                          ? formatarDataCurta(user.created_at, true)
                          : "-"}
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-4 text-right">
                        {isLoadingThis ? (
                          <div className="inline-flex items-center justify-end">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Botão Visualizar */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewUser(user)}
                              className="h-8 px-2 text-slate-600 hover:text-primary hover:border-primary gap-1 text-xs"
                              title="Visualizar Informações do Colunista"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Ver</span>
                            </Button>

                            {/* Botão Editar */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEdit(user)}
                              className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1 text-xs"
                              title="Editar Informações do Colunista"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Editar</span>
                            </Button>

                            {/* Aprovação para Pendentes */}
                            {user.status === "pendente" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(user.id, "aprovar")}
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 text-xs gap-1 px-2"
                                title="Aprovar Usuário"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Aprovar</span>
                              </Button>
                            )}

                            {/* Desbloquear / Ativar */}
                            {user.status === "bloqueado" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(user.id, "ativar")}
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 text-xs gap-1 px-2"
                                title="Ativar Usuário"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Ativar</span>
                              </Button>
                            )}

                            {/* Bloquear */}
                            {user.status === "ativo" && !isSelf && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAction(user.id, "bloquear")}
                                className="text-destructive hover:bg-destructive/10 h-8 text-xs gap-1 px-2"
                                title="Bloquear Acesso"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            {/* Alterar Role rápido */}
                            {!isSelf && (
                              <Select
                                value={user.role}
                                onChange={(e) =>
                                  handleAction(user.id, "alterar_role", e.target.value as UserRole)
                                }
                                className="h-8 text-xs w-24"
                                title="Alterar nível de acesso"
                              >
                                <option value="colunista">Colunista</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                                <option value="anunciante">Anunciante</option>
                              </Select>
                            )}

                            {/* Excluir Cadastro */}
                            {!isSelf && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteConfirmUser(user)}
                                className="h-8 px-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1 text-xs"
                                title="Excluir cadastro permanentemente"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VISUALIZAR DADOS DO COLUNISTA / USUÁRIO */}
      {viewUser && (
        <Dialog open={Boolean(viewUser)} onOpenChange={(open) => !open && setViewUser(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Dados do Usuário / Colunista
              </DialogTitle>
              <DialogDescription>
                Informações cadastrais detalhadas e contatos registrados no portal.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Cabeçalho do Usuário */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                  {viewUser.foto_url ? (
                    <Image src={viewUser.foto_url} alt={viewUser.nome} fill className="object-cover" />
                  ) : (
                    viewUser.nome.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    {viewUser.nome}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{viewUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant={roleColors[viewUser.role]} className="uppercase text-[10px]">
                      {viewUser.role}
                    </Badge>
                    <Badge variant={statusColors[viewUser.status]} className="uppercase text-[10px]">
                      {viewUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Grid de Informações de Contato e Localização */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {/* Telefone / WhatsApp */}
                {(() => {
                  const viewPhone: string | null = (viewUser.telefone || (viewUser.redes_sociais as Record<string, any> | null)?.whatsapp) || null;
                  return (
                    <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> Telefone / WhatsApp
                      </span>
                      {viewPhone ? (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {viewPhone}
                          </span>
                          <a
                            href={`https://wa.me/55${viewPhone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded hover:underline inline-flex items-center gap-1"
                          >
                            Abrir Chat
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Não informado</span>
                      )}
                    </div>
                  );
                })()}

                {/* Instagram */}
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram
                  </span>
                  {viewUser.redes_sociais?.instagram ? (
                    <a
                      href={`https://instagram.com/${viewUser.redes_sociais.instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-pink-600 hover:underline flex items-center gap-1"
                    >
                      @{viewUser.redes_sociais.instagram.replace(/^@/, "")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Não informado</span>
                  )}
                </div>

                {/* Endereço Completo */}
                {(() => {
                  const dadosEnd = (viewUser.redes_sociais?.dados_endereco as Record<string, string>) || {};
                  const cidade = viewUser.cidade || dadosEnd.cidade;
                  const uf = viewUser.uf || dadosEnd.uf;
                  const cep = viewUser.cep || dadosEnd.cep;
                  const logradouro = dadosEnd.logradouro;
                  const numero = dadosEnd.numero;
                  const complemento = dadosEnd.complemento;
                  const bairro = dadosEnd.bairro;
                  const rawEndereco = viewUser.endereco || (viewUser.redes_sociais?.endereco as string);

                  const temEndereco = Boolean(rawEndereco || cidade || uf || logradouro);
                  const searchAddress = [
                    logradouro || rawEndereco,
                    numero ? `Nº ${numero}` : "",
                    bairro,
                    cidade,
                    uf,
                    cep,
                  ].filter(Boolean).join(", ");

                  return (
                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sm:col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" /> Endereço Completo & Localização
                        </span>
                        {temEndereco && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            Ver no Google Maps <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {temEndereco ? (
                        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                          {/* Logradouro e Número */}
                          <div className="font-medium text-slate-900 dark:text-white">
                            {logradouro || rawEndereco}
                            {numero ? `, Nº ${numero}` : ""}
                            {complemento ? ` (${complemento})` : ""}
                          </div>

                          {/* Bairro, Cidade e UF destacados */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {bairro && (
                              <span className="text-slate-600 dark:text-slate-400">
                                Bairro: <strong className="text-slate-800 dark:text-slate-200">{bairro}</strong>
                              </span>
                            )}

                            {(cidade || uf) && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                                <Building2 className="w-3 h-3" />
                                {cidade || "Cidade não informada"} {uf ? `- ${uf}` : ""}
                              </span>
                            )}

                            {cep && (
                              <span className="text-slate-500">
                                CEP: <strong className="font-mono text-slate-700 dark:text-slate-300">{cep}</strong>
                              </span>
                            )}
                          </div>

                          {!cidade && !uf && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 pt-0.5">
                              * Cidade e UF ainda não detalhadas. Clique em &quot;Editar Informações&quot; para preenchê-las com CEP.
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Nenhum endereço cadastrado</span>
                      )}
                    </div>
                  );
                })()}

                {/* Bio / Apresentação */}
                {viewUser.bio && (
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sm:col-span-2 space-y-1">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" /> Mini Bio / Sobre
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {viewUser.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Rodapé de Informações Técnicas */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Cadastrado em: {formatarDataCurta(viewUser.created_at, true)}</span>
                {viewUser.role === "colunista" && (
                  <a
                    href={`/colunista/${viewUser.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    Ver Coluna Pública <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const u = viewUser;
                    setViewUser(null);
                    handleOpenEdit(u);
                  }}
                  className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Pencil className="w-4 h-4" />
                  Editar Informações
                </Button>

                {currentAdminId !== viewUser.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const u = viewUser;
                      setViewUser(null);
                      setDeleteConfirmUser(u);
                    }}
                    className="gap-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 text-xs"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    Excluir Cadastro
                  </Button>
                )}
              </div>

              <Button variant="secondary" size="sm" onClick={() => setViewUser(null)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 2: EDITAR INFORMAÇÕES DO COLUNISTA / USUÁRIO */}
      {editUser && (
        <Dialog open={Boolean(editUser)} onOpenChange={(open) => !open && setEditUser(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Pencil className="w-5 h-5 text-primary" />
                Editar Informações do Usuário
              </DialogTitle>
              <DialogDescription>
                Atualize dados cadastrais, contatos, endereço completo (com CEP/Cidade/UF) e permissões.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label htmlFor="edit-nome">Nome Completo *</Label>
                  <Input
                    id="edit-nome"
                    required
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-role">Nível de Acesso (Role) *</Label>
                  <Select
                    id="edit-role"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="mt-1"
                  >
                    <option value="colunista">Colunista</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                    <option value="anunciante">Anunciante</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-status">Status da Conta *</Label>
                  <Select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                    className="mt-1"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="pendente">Pendente</option>
                    <option value="bloqueado">Bloqueado</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-telefone">Telefone / WhatsApp</Label>
                  <Input
                    id="edit-telefone"
                    placeholder="(11) 99999-9999"
                    value={editTelefone}
                    onChange={(e) => setEditTelefone(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-instagram">Instagram (@usuario)</Label>
                  <Input
                    id="edit-instagram"
                    placeholder="@joaosilva"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* BLOCO DE ENDEREÇO COMPLETO NA EDIÇÃO */}
                <div className="sm:col-span-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> Endereço Completo & Localização
                    </span>
                    <span className="text-[11px] text-slate-400">
                      CEP automático ou preenchimento manual
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5">
                    {/* CEP */}
                    <div className="sm:col-span-2">
                      <Label htmlFor="edit-cep" className="text-xs">CEP</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <Input
                          id="edit-cep"
                          placeholder="00000-000"
                          maxLength={9}
                          value={editCep}
                          onChange={(e) => {
                            const val = maskCep(e.target.value);
                            setEditCep(val);
                            if (val.replace(/\D/g, "").length === 8) {
                              handleBuscarCepEdit(val);
                            }
                          }}
                          className="h-8 text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleBuscarCepEdit()}
                          disabled={isSearchingEditCep}
                          className="h-8 px-2 text-xs shrink-0"
                          title="Buscar CEP no ViaCEP"
                        >
                          {isSearchingEditCep ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>

                    {/* Rua */}
                    <div className="sm:col-span-4">
                      <Label htmlFor="edit-logradouro" className="text-xs">Logradouro / Rua</Label>
                      <Input
                        id="edit-logradouro"
                        placeholder="Ex: Av. Paulista, Rua..."
                        value={editLogradouro}
                        onChange={(e) => setEditLogradouro(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>

                    {/* Número */}
                    <div className="sm:col-span-2">
                      <Label htmlFor="edit-numero" className="text-xs">Número</Label>
                      <Input
                        id="edit-numero"
                        placeholder="Ex: 327"
                        value={editNumero}
                        onChange={(e) => setEditNumero(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>

                    {/* Complemento */}
                    <div className="sm:col-span-2">
                      <Label htmlFor="edit-complemento" className="text-xs">Complemento</Label>
                      <Input
                        id="edit-complemento"
                        placeholder="Ex: Apto 101"
                        value={editComplemento}
                        onChange={(e) => setEditComplemento(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>

                    {/* Bairro */}
                    <div className="sm:col-span-2">
                      <Label htmlFor="edit-bairro" className="text-xs">Bairro</Label>
                      <Input
                        id="edit-bairro"
                        placeholder="Ex: Centro"
                        value={editBairro}
                        onChange={(e) => setEditBairro(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>

                    {/* Cidade */}
                    <div className="sm:col-span-4">
                      <Label htmlFor="edit-cidade" className="text-xs">Cidade *</Label>
                      <Input
                        id="edit-cidade"
                        placeholder="Ex: Vitória, São Paulo..."
                        value={editCidade}
                        onChange={(e) => setEditCidade(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>

                    {/* UF */}
                    <div className="sm:col-span-2">
                      <Label htmlFor="edit-uf" className="text-xs">UF / Estado *</Label>
                      <Select
                        id="edit-uf"
                        value={editUf}
                        onChange={(e) => setEditUf(e.target.value.toUpperCase())}
                        className="mt-1 h-8 text-xs"
                      >
                        <option value="">Selecione UF</option>
                        {UFS_BRASIL.map((uf) => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {editCepNotice && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editCepNotice}</span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="edit-bio">Mini Bio / Apresentação</Label>
                  <Textarea
                    id="edit-bio"
                    placeholder="Resumo profissional ou biografia..."
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-end pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditUser(null)}
                  disabled={isSavingEdit}
                >
                  Cancelar
                </Button>

                <Button type="submit" size="sm" disabled={isSavingEdit} className="gap-2">
                  {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isSavingEdit ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 3: CONFIRMAÇÃO DE EXCLUSÃO DE USUÁRIO */}
      {deleteConfirmUser && (
        <Dialog
          open={Boolean(deleteConfirmUser)}
          onOpenChange={(open) => !open && !isDeleting && setDeleteConfirmUser(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-rose-600">
                <Trash2 className="w-5 h-5 text-rose-600" />
                Excluir Cadastro de Usuário
              </DialogTitle>
              <DialogDescription className="pt-1 text-slate-600 dark:text-slate-300">
                Tem certeza que deseja excluir permanentemente o cadastro de{" "}
                <strong className="text-slate-900 dark:text-white font-semibold">
                  {deleteConfirmUser.nome}
                </strong>{" "}
                ({deleteConfirmUser.email})?
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3 rounded-xl space-y-1">
              <span className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> Atenção:
              </span>
              Esta ação é definitiva e removerá o perfil e o acesso deste usuário ao sistema do portal.
            </div>

            <DialogFooter className="gap-2 sm:justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmUser(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? "Excluindo..." : "Sim, Excluir Cadastro"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
