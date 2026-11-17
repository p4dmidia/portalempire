"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, ArrowUpRight, QrCode } from "lucide-react";

interface SolicitarSaqueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saldoDisponivel: number;
  saqueMinimo: number;
  chavePix: string | null;
  tipoChavePix: string | null;
  onOpenPixDialog: () => void;
  onSuccess: (novoS掛け: unknown, novoSaldo: number) => void;
}

export function SolicitarSaqueDialog({
  open,
  onOpenChange,
  saldoDisponivel,
  saqueMinimo,
  chavePix,
  tipoChavePix,
  onOpenPixDialog,
  onSuccess,
}: SolicitarSaqueDialogProps) {
  const [valorStr, setValorStr] = useState<string>("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const valor = parseFloat(valorStr) || 0;

  const handleSacarTudo = () => {
    setValorStr(saldoDisponivel.toFixed(2));
    setErro(null);
  };

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!chavePix) {
      setErro("Você precisa cadastrar sua chave PIX antes de solicitar o saque.");
      return;
    }

    if (valor < saqueMinimo) {
      setErro(
        `O valor mínimo para solicitação de saque é de R$ ${saqueMinimo.toFixed(2)}.`
      );
      return;
    }

    if (valor > saldoDisponivel) {
      setErro(
        `Saldo insuficiente. Seu saldo disponível é de R$ ${saldoDisponivel.toFixed(2)}.`
      );
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch("/api/colunista/afiliados/saque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor,
          chave_pix: chavePix,
          tipo_chave_pix: tipoChavePix || "cpf",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Erro ao solicitar saque.");
      }

      onSuccess(json.saque, json.novo_saldo);
      onOpenChange(false);
      setValorStr("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro interno ao solicitar saque.";
      setErro(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Solicitar Saque via PIX</DialogTitle>
              <DialogDescription className="text-xs">
                Transfira sua participação nas mensalidades dos assinantes para sua conta.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {erro && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleConfirmar} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Saldo Disponível
              </p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                R$ {saldoDisponivel.toFixed(2)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSacarTudo}
              className="text-xs font-semibold"
            >
              Sacar Tudo
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="valor_saque" className="text-xs font-semibold">
              Valor do Saque (R$) *
            </Label>
            <Input
              id="valor_saque"
              type="number"
              step="0.01"
              min={saqueMinimo}
              max={saldoDisponivel}
              value={valorStr}
              onChange={(e) => setValorStr(e.target.value)}
              placeholder={`Mínimo R$ ${saqueMinimo.toFixed(2)}`}
              className="text-base font-semibold"
            />
            <p className="text-[11px] text-muted-foreground">
              Valor mínimo permitido: R$ {saqueMinimo.toFixed(2)}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-primary" />
                Destino do PIX
              </span>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onOpenPixDialog();
                }}
                className="text-[11px] text-primary hover:underline font-normal"
              >
                Alterar chave
              </button>
            </div>

            {chavePix ? (
              <p className="text-xs font-mono text-slate-800 dark:text-slate-200 font-semibold bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 break-all">
                {chavePix} ({tipoChavePix?.toUpperCase()})
              </p>
            ) : (
              <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                Nenhuma chave PIX cadastrada.{" "}
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenPixDialog();
                  }}
                  className="font-bold underline"
                >
                  Cadastre agora
                </button>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={salvando || !chavePix || valor < saqueMinimo || valor > saldoDisponivel}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {salvando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Solicitando...
                </>
              ) : (
                "Confirmar Solicitação de Saque"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
