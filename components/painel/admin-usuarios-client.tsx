"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile, UserRole, UserStatus } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  // Estado para Modal/Form de Convidar Usuário
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteNome, setInviteNome] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("colunista");
  const [isInviting, setIsInviting] = useState(false);
  const [tempPasswordCreated, setTempPasswordCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Filtragem
  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setFeedback(null);
    setTempPasswordCreated(null);

    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "convidar",
          nome: inviteNome,
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao convidar usuário.");
      }

      setTempPasswordCreated(data.tempPassword);
      setFeedback({ type: "success", message: "Usuário convidado com sucesso!" });
      setInviteNome("");
      setInviteEmail("");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao convidar";
      setFeedback({ type: "error", message });
    } finally {
      setIsInviting(false);
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
            Aprovação de colunistas, controle de acessos, convites e alteração de permissões.
          </p>
        </div>

        <Button
          onClick={() => {
            setIsInviteOpen(!isInviteOpen);
            setTempPasswordCreated(null);
          }}
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {isInviteOpen ? "Fechar Convite" : "Convidar Novo Usuário"}
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

      {/* Formulário de Convidar Usuário */}
      {isInviteOpen && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Convidar Membro para a Equipe
            </CardTitle>
            <CardDescription>
              Crie o usuário diretamente com status ativo e perfil definido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tempPasswordCreated ? (
              <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Conta criada com sucesso! Envie as credenciais para o usuário:
                </div>
                <div className="flex items-center gap-2">
                  <Input readOnly value={tempPasswordCreated} className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tempPasswordCreated)}
                    className="gap-1.5"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <Label htmlFor="invite-nome">Nome Completo</Label>
                  <Input
                    id="invite-nome"
                    required
                    placeholder="Nome do membro"
                    value={inviteNome}
                    onChange={(e) => setInviteNome(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="invite-email">E-mail</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    required
                    placeholder="email@portal.com.br"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="invite-role">Nível de Acesso (Role)</Label>
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

                <Button type="submit" disabled={isInviting} className="w-full">
                  {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar Convite"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Barra de Filtros */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nome, e-mail ou slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="w-40">
              <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="todos">Todos os Roles</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="colunista">Colunista</option>
                <option value="anunciante">Anunciante</option>
              </Select>
            </div>

            <div className="w-40">
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="pendente">Pendente</option>
                <option value="bloqueado">Bloqueado</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-4 py-4">Nível (Role)</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Cadastro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((user) => {
                  const isLoadingThis = loadingActionId === user.id;
                  const isSelf = user.id === currentAdminId;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden relative flex items-center justify-center shrink-0">
                            {user.foto_url ? (
                              <Image src={user.foto_url} alt={user.nome} fill className="object-cover" />
                            ) : (
                              <Users className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {user.nome}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={roleColors[user.role]} className="uppercase text-[10px]">
                          {user.role}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={statusColors[user.status]} className="uppercase text-[10px]">
                          {user.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {user.created_at
                          ? format(new Date(user.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "-"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isLoadingThis ? (
                          <div className="inline-flex items-center justify-end">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {/* Aprovação para Pendentes */}
                            {user.status === "pendente" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(user.id, "aprovar")}
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 text-xs gap-1"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Aprovar
                              </Button>
                            )}

                            {/* Desbloquear / Ativar */}
                            {user.status === "bloqueado" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(user.id, "ativar")}
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 text-xs gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Ativar
                              </Button>
                            )}

                            {/* Bloquear */}
                            {user.status === "ativo" && !isSelf && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAction(user.id, "bloquear")}
                                className="text-destructive hover:bg-destructive/10 h-8 text-xs gap-1"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Bloquear
                              </Button>
                            )}

                            {/* Alterar Role */}
                            {!isSelf && (
                              <Select
                                value={user.role}
                                onChange={(e) =>
                                  handleAction(user.id, "alterar_role", e.target.value as UserRole)
                                }
                                className="h-8 text-xs w-28"
                              >
                                <option value="colunista">Colunista</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                                <option value="anunciante">Anunciante</option>
                              </Select>
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
    </div>
  );
}
