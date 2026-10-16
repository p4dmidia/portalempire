"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Banknote,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Search,
  Loader2,
  XCircle,
  CheckCheck,
} from "lucide-react";

export interface SaqueAdminItem {
  id: string;
  valor: number;
  chave_pix: string;
  tipo_chave_pix: string;
  status: "pendente" | "pago" | "rejeitado";
  comprovante: string | null;
  motivo_rejeicao: string | null;
  solicitado_em: string;
  pago_em: string | null;
  colunista?: {
    id: string;
    nome: string;
    email: string;
    slug: string;
    foto_url: string | null;
  } | null;
}

interface AdminSaquesViewProps {
  initialSaques: SaqueAdminItem[];
}

export function AdminSaquesView({ initialSaques }: AdminSaquesViewProps) {
  const [saques, setSaques] = useState<SaqueAdminItem[]>(initialSaques);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "pendente" | "pago" | "rejeitado">("todos");
  const [chaveCopiadaId, setChaveCopiadaId] = useState<string | null>(null);

  // Modais de Ação
  const [saqueAprovando, setSaqueAprovando] = useState<SaqueAdminItem | null>(null);
  const [comprovanteInput, setComprovanteInput] = useState("");
  const [saqueRejeitando, setSaqueRejeitando] = useState<SaqueAdminItem | null>(null);
  const [motivoRejeicaoInput, setMotivoRejeicaoInput] = useState("");
  const [processando, setProcessando] = useState(false);
  const [mensagemAcao, setMensagemAcao] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  const handleCopiarChave = async (saqueId: string, chave: string) => {
    try {
      await navigator.clipboard.writeText(chave);
      setChaveCopiadaId(saqueId);
      setTimeout(() => setChaveCopiadaId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleMarcarComoPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saqueAprovando) return;
    setProcessando(true);
    setMensagemAcao(null);

    try {
      const res = await fetch(`/api/admin/saques/${saqueAprovando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "pago",
          comprovante: comprovanteInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao processar saque.");

      setSaques((prev) =>
        prev.map((s) =>
          s.id === saqueAprovando.id
            ? { ...s, status: "pago", pago_em: new Date().toISOString(), comprovante: comprovanteInput.trim() || null }
            : s
        )
      );

      setMensagemAcao({ tipo: "sucesso", texto: "Saque marcado como pago com sucesso!" });
      setSaqueAprovando(null);
      setComprovanteInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setMensagemAcao({ tipo: "erro", texto: msg });
    } finally {
      setProcessando(false);
    }
  };

  const handleRejeitarSaque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saqueRejeitando) return;
    setProcessando(true);
    setMensagemAcao(null);

    try {
      const res = await fetch(`/api/admin/saques/${saqueRejeitando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejeitado",
          motivo_rejeicao: motivoRejeicaoInput.trim() || "Chave PIX inválida ou divergente.",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao rejeitar saque.");

      setSaques((prev) =>
        prev.map((s) =>
          s.id === saqueRejeitando.id
            ? { ...s, status: "rejeitado", motivo_rejeicao: motivoRejeicaoInput.trim() }
            : s
        )
      );

      setMensagemAcao({ tipo: "sucesso", texto: "Saque rejeitado e saldo restituído ao colunista." });
      setSaqueRejeitando(null);
      setMotivoRejeicaoInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setMensagemAcao({ tipo: "erro", texto: msg });
    } finally {
      setProcessando(false);
    }
  };

  // Cálculos de KPIs
  const totalPendente = saques
    .filter((s) => s.status === "pendente")
    .reduce((acc, s) => acc + Number(s.valor), 0);

  const qtdPendente = saques.filter((s) => s.status === "pendente").length;

  const totalPago = saques
    .filter((s) => s.status === "pago")
    .reduce((acc, s) => acc + Number(s.valor), 0);

  // Filtros aplicados
  const saquesFiltrados = saques.filter((s) => {
    const atendeStatus = filtroStatus === "todos" || s.status === filtroStatus;
    const nomeColunista = s.colunista?.nome?.toLowerCase() || "";
    const emailColunista = s.colunista?.email?.toLowerCase() || "";
    const chave = s.chave_pix.toLowerCase();
    const buscaTratada = busca.toLowerCase().trim();

    const atendeBusca =
      !buscaTratada ||
      nomeColunista.includes(buscaTratada) ||
      emailColunista.includes(buscaTratada) ||
      chave.includes(buscaTratada);

    return atendeStatus && atendeBusca;
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Banknote className="w-6 h-6 text-primary" />
          Gestão de Saques PIX de Afiliados
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Acompanhe os pedidos de resgate das comissões de 20%, realize a transferência manual via PIX
          no seu banco e marque como pago.
        </p>
      </div>

      {mensagemAcao && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-start gap-3 border ${
            mensagemAcao.tipo === "sucesso"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {mensagemAcao.tipo === "sucesso" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          )}
          <p className="font-medium">{mensagemAcao.texto}</p>
        </div>
      )}

      {/* CARDS KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              Aguardando Pagamento
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-800 dark:text-amber-200">
              R$ {totalPendente.toFixed(2)}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-1">
              {qtdPendente} {qtdPendente === 1 ? "solicitação pendente" : "solicitações pendentes"}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Total Pago aos Colunistas
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600">
              <CheckCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-200">
              R$ {totalPago.toFixed(2)}
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-1">
              Transferências realizadas via PIX
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Solicitações
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {saques.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Histórico completo de resgates</p>
          </div>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por colunista, e-mail ou chave PIX..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["todos", "pendente", "pago", "rejeitado"] as const).map((status) => (
            <Button
              key={status}
              onClick={() => setFiltroStatus(status)}
              variant={filtroStatus === status ? "default" : "outline"}
              size="sm"
              className="text-xs capitalize"
            >
              {status === "todos"
                ? "Todos"
                : status === "pendente"
                ? "Pendentes"
                : status === "pago"
                ? "Pagos"
                : "Rejeitados"}
            </Button>
          ))}
        </div>
      </div>

      {/* TABELA DE SAQUES */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {saquesFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Nenhuma solicitação de saque encontrada com os filtros selecionados.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colunista</TableHead>
                <TableHead>Valor Solicitado</TableHead>
                <TableHead>Chave PIX</TableHead>
                <TableHead>Data do Pedido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saquesFiltrados.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {s.colunista?.nome || "Colunista"}
                    </div>
                    <div className="text-xs text-slate-400">{s.colunista?.email}</div>
                  </TableCell>

                  <TableCell className="font-black text-sm text-slate-900 dark:text-white">
                    R$ {Number(s.valor).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {s.tipo_chave_pix}
                        </span>
                        <span className="font-mono text-xs text-slate-800 dark:text-slate-200">
                          {s.chave_pix}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopiarChave(s.id, s.chave_pix)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
                        title="Copiar Chave PIX"
                      >
                        {chaveCopiadaId === s.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-slate-500">
                    {new Date(s.solicitado_em).toLocaleDateString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>

                  <TableCell>
                    {s.status === "pago" ? (
                      <Badge className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                        Pago via PIX
                      </Badge>
                    ) : s.status === "rejeitado" ? (
                      <Badge className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200">
                        Rejeitado
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 animate-pulse">
                        Pendente
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {s.status === "pendente" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => setSaqueAprovando(s)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Marcar Pago
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSaqueRejeitando(s)}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 h-8 text-xs"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Rejeitar
                        </Button>
                      </div>
                    ) : s.status === "pago" ? (
                      <span className="text-[11px] text-slate-400">
                        Pago em {s.pago_em ? new Date(s.pago_em).toLocaleDateString("pt-BR") : "—"}
                        {s.comprovante && <span className="block italic">Comp: {s.comprovante}</span>}
                      </span>
                    ) : (
                      <span className="text-[11px] text-red-500 italic">
                        {s.motivo_rejeicao || "Rejeitado"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* MODAL MARCAR COMO PAGO */}
      <Dialog open={!!saqueAprovando} onOpenChange={(open) => !open && setSaqueAprovando(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Confirmar Pagamento de Saque PIX
            </DialogTitle>
            <DialogDescription>
              Confirme que você realizou a transferência PIX de{" "}
              <strong>R$ {Number(saqueAprovando?.valor || 0).toFixed(2)}</strong> para o colunista{" "}
              <strong>{saqueAprovando?.colunista?.nome}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border text-xs">
            <div>
              <span className="text-slate-400">Chave PIX:</span>{" "}
              <strong className="font-mono">{saqueAprovando?.chave_pix}</strong> (
              {saqueAprovando?.tipo_chave_pix})
            </div>
            <div>
              <span className="text-slate-400">Colunista:</span>{" "}
              <strong>{saqueAprovando?.colunista?.nome}</strong> ({saqueAprovando?.colunista?.email})
            </div>
          </div>

          <form onSubmit={handleMarcarComoPago} className="space-y-4 py-2">
            <div>
              <Label htmlFor="comprovante">ID da Transação / Comprovante PIX (Opcional)</Label>
              <Input
                id="comprovante"
                value={comprovanteInput}
                onChange={(e) => setComprovanteInput(e.target.value)}
                placeholder="Ex: E123456782026101412345678 ou link"
                className="mt-1 font-mono text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSaqueAprovando(null)}
                disabled={processando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={processando}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {processando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                  </>
                ) : (
                  "Confirmar que o PIX foi Pago"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL REJEITAR SAQUE */}
      <Dialog open={!!saqueRejeitando} onOpenChange={(open) => !open && setSaqueRejeitando(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Rejeitar Solicitação de Saque
            </DialogTitle>
            <DialogDescription>
              Ao rejeitar, o valor de{" "}
              <strong>R$ {Number(saqueRejeitando?.valor || 0).toFixed(2)}</strong> será devolvido
              automaticamente ao saldo do colunista.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRejeitarSaque} className="space-y-4 py-2">
            <div>
              <Label htmlFor="motivoRejeicao">Motivo da Rejeição</Label>
              <Input
                id="motivoRejeicao"
                value={motivoRejeicaoInput}
                onChange={(e) => setMotivoRejeicaoInput(e.target.value)}
                placeholder="Ex: Chave PIX incorreta ou inexistente no banco"
                required
                className="mt-1"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSaqueRejeitando(null)}
                disabled={processando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={processando}
                variant="destructive"
              >
                {processando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
                  </>
                ) : (
                  "Confirmar Rejeição & Devolver Saldo"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
