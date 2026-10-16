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
  Share2,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
  ArrowDownCircle,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";

export interface ColunistaIndicadoItem {
  id: string;
  nome: string;
  slug: string;
  foto_url: string | null;
  data_cadastro: string;
  status_conta: string;
  status_assinatura: string;
  coluna_nome: string | null;
  cidade_nome: string | null;
  valor_mensal: number;
  comissao_gerada_mensal: number;
}

export interface ComissaoItem {
  id: string;
  mes_referencia: string;
  valor_mensalidade: number;
  percentual_comissao: number;
  valor_comissao: number;
  status: string;
  data: string;
  indicado_nome: string;
}

export interface SaqueItem {
  id: string;
  valor: number;
  chave_pix: string;
  tipo_chave_pix: string;
  status: "pendente" | "pago" | "rejeitado";
  comprovante?: string | null;
  motivo_rejeicao?: string | null;
  solicitado_em: string;
  pago_em?: string | null;
}

interface ColunistaAfiliadosViewProps {
  initialData: {
    codigo_afiliado: string;
    link_afiliado: string;
    saldo_disponivel: number;
    total_resgatado: number;
    total_ganho: number;
    mrr_estimado: number;
    total_indicados: number;
    indicados_ativos: number;
    comissao_percentual: number;
    saque_minimo: number;
    chave_pix_salva?: string | null;
    tipo_chave_pix_salva?: string | null;
    indicados: ColunistaIndicadoItem[];
    comissoes: ComissaoItem[];
    saques: SaqueItem[];
  };
}

export function ColunistaAfiliadosView({ initialData }: ColunistaAfiliadosViewProps) {
  const [data, setData] = useState(initialData);
  const [abaAtiva, setAbaAtiva] = useState<"indicados" | "comissoes" | "saques">("indicados");
  const [copiado, setCopiado] = useState(false);

  // Modal de Saque
  const [modalSaqueAberto, setModalSaqueAberto] = useState(false);
  const [valorSaque, setValorSaque] = useState(
    initialData.saldo_disponivel >= initialData.saque_minimo
      ? initialData.saldo_disponivel.toFixed(2)
      : initialData.saque_minimo.toFixed(2)
  );
  const [chavePix, setChavePix] = useState(initialData.chave_pix_salva || "");
  const [tipoChavePix, setTipoChavePix] = useState(initialData.tipo_chave_pix_salva || "cpf");
  const [solicitandoSaque, setSolicitandoSaque] = useState(false);
  const [erroSaque, setErroSaque] = useState<string | null>(null);
  const [sucessoSaque, setSucessoSaque] = useState<string | null>(null);

  const handleCopiarLink = async () => {
    try {
      await navigator.clipboard.writeText(data.link_afiliado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Fallback
    }
  };

  const textoWhatsApp = encodeURIComponent(
    `Olá! Venha criar sua coluna regional no Portal Empire e monetizar com anúncios na sua cidade. Cadastre-se pelo meu link de parceiro: ${data.link_afiliado}`
  );

  const handleSolicitarSaque = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroSaque(null);
    setSucessoSaque(null);
    setSolicitandoSaque(true);

    const valorNum = parseFloat(valorSaque.replace(",", "."));
    if (isNaN(valorNum) || valorNum <= 0) {
      setErroSaque("Informe um valor numérico válido.");
      setSolicitandoSaque(false);
      return;
    }

    if (valorNum < data.saque_minimo) {
      setErroSaque(`O valor mínimo para resgate é de R$ ${data.saque_minimo.toFixed(2)}.`);
      setSolicitandoSaque(false);
      return;
    }

    if (valorNum > data.saldo_disponivel) {
      setErroSaque(`Saldo insuficiente. Você tem R$ ${data.saldo_disponivel.toFixed(2)} disponível.`);
      setSolicitandoSaque(false);
      return;
    }

    if (!chavePix.trim()) {
      setErroSaque("Por favor, informe sua Chave PIX.");
      setSolicitandoSaque(false);
      return;
    }

    try {
      const res = await fetch("/api/colunista/afiliados/saque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: valorNum,
          chave_pix: chavePix.trim(),
          tipo_chave_pix: tipoChavePix,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Erro ao solicitar saque.");
      }

      setSucessoSaque("Solicitação de saque enviada! O administrador processará seu PIX em breve.");
      setData((prev) => ({
        ...prev,
        saldo_disponivel: resData.novo_saldo,
        saques: [resData.saque, ...prev.saques],
      }));

      setTimeout(() => {
        setModalSaqueAberto(false);
        setSucessoSaque(null);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setErroSaque(msg);
    } finally {
      setSolicitandoSaque(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-primary" />
            Programa de Afiliados & Indicações
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Indique novos colunistas e receba{" "}
            <strong className="text-emerald-600 dark:text-emerald-400">
              {data.comissao_percentual}% de comissão recorrente
            </strong>{" "}
            todo mês enquanto eles mantiverem a coluna ativa.
          </p>
        </div>

        <Button
          onClick={() => setModalSaqueAberto(true)}
          disabled={data.saldo_disponivel < data.saque_minimo}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
        >
          <ArrowDownCircle className="w-4 h-4 mr-2" />
          Solicitar Saque PIX
        </Button>
      </div>

      {/* BOX DO LINK EXCLUSIVO DE AFILIADO */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur-sm border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            Seu Link Exclusivo de Indicação
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Convide colunistas e construa uma renda mensal recorrente
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            Qualquer jornalista ou escritor que se cadastrar usando seu link ficará permanentemente
            vinculado a você. Cada mensalidade paga por ele gera {data.comissao_percentual}% direto
            no seu saldo.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
            <div className="relative flex-1">
              <Input
                readOnly
                value={data.link_afiliado}
                className="bg-black/40 border-white/20 text-white font-mono text-xs sm:text-sm h-11 pr-24 focus-visible:ring-blue-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Ref: {data.codigo_afiliado}
              </span>
            </div>

            <Button
              onClick={handleCopiarLink}
              variant="secondary"
              className="h-11 shrink-0 font-semibold"
            >
              {copiado ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-emerald-600" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" /> Copiar Link
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => window.open(`https://api.whatsapp.com/send?text=${textoWhatsApp}`, "_blank")}
              className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 font-semibold gap-2"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* CARDS DE MÉTRICAS / KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Disponível */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Saldo Disponível
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              R$ {data.saldo_disponivel.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {data.saldo_disponivel >= data.saque_minimo ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Pronto para saque via PIX
                </span>
              ) : (
                `Saque mínimo: R$ ${data.saque_minimo.toFixed(2)}`
              )}
            </p>
          </div>
        </div>

        {/* Card 2: Renda Recorrente Estimada (MRR) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Renda Recorrente (MRR)
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              R$ {data.mrr_estimado.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">/mês</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {data.comissao_percentual}% das mensalidades ativas
            </p>
          </div>
        </div>

        {/* Card 3: Indicados Ativos */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Indicados Ativos
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {data.indicados_ativos}
              <span className="text-xs font-normal text-slate-400 ml-1">
                de {data.total_indicados} cadastrados
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Colunistas gerando repasse mensal</p>
          </div>
        </div>

        {/* Card 4: Total Já Resgatado */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Já Resgatado
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              R$ {data.total_resgatado.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Pago com sucesso via PIX</p>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DE ABAS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setAbaAtiva("indicados")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              abaAtiva === "indicados"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Colunistas Indicados ({data.indicados.length})
          </button>

          <button
            onClick={() => setAbaAtiva("comissoes")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              abaAtiva === "comissoes"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Extrato de Comissões ({data.comissoes.length})
          </button>

          <button
            onClick={() => setAbaAtiva("saques")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              abaAtiva === "saques"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Histórico de Saques PIX ({data.saques.length})
          </button>
        </div>

        {/* ABA 1: LISTA DE COLUNISTAS INDICADOS */}
        {abaAtiva === "indicados" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {data.indicados.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  Nenhum colunista indicado ainda
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Compartilhe seu link exclusivo de afiliado com jornalistas, blogueiros e produtores
                  de conteúdo locais para começar a ganhar.
                </p>
                <Button onClick={handleCopiarLink} variant="outline" size="sm">
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar Link de Afiliado
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colunista</TableHead>
                    <TableHead>Coluna / Cidade</TableHead>
                    <TableHead>Data de Entrada</TableHead>
                    <TableHead>Status Mensalidade</TableHead>
                    <TableHead className="text-right">Comissão Mensal (20%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.indicados.map((ind) => (
                    <TableRow key={ind.id}>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {ind.nome}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                        {ind.coluna_nome ? (
                          <>
                            <span className="font-medium text-slate-900 dark:text-white block">
                              {ind.coluna_nome}
                            </span>
                            <span className="text-[11px] text-slate-400">{ind.cidade_nome}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Coluna em criação</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(ind.data_cadastro).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {ind.status_assinatura === "ativa" ? (
                          <Badge className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                            Em dia (Ativa)
                          </Badge>
                        ) : ind.status_assinatura === "atrasada" ? (
                          <Badge className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200">
                            Atrasada
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200">
                            Aguardando Pagamento
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        R$ {ind.comissao_gerada_mensal.toFixed(2)}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          sobre R$ {ind.valor_mensal.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}

        {/* ABA 2: EXTRATO DE COMISSÕES */}
        {abaAtiva === "comissoes" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {data.comissoes.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Nenhuma comissão creditada ainda. Quando seus indicados pagarem suas mensalidades, os
                créditos aparecerão aqui.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês Ref.</TableHead>
                    <TableHead>Colunista Indicado</TableHead>
                    <TableHead>Data do Crédito</TableHead>
                    <TableHead>Valor Mensalidade</TableHead>
                    <TableHead>Comissão (20%)</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.comissoes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {c.mes_referencia}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {c.indicado_nome}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(c.data).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                        R$ {c.valor_mensalidade.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                        + R$ {c.valor_comissao.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                          Creditado no Saldo
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}

        {/* ABA 3: HISTÓRICO DE SAQUES PIX */}
        {abaAtiva === "saques" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {data.saques.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Nenhum saque solicitado até o momento.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data do Pedido</TableHead>
                    <TableHead>Valor Solicitado</TableHead>
                    <TableHead>Chave PIX</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Data de Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.saques.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                        {new Date(s.solicitado_em).toLocaleDateString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 dark:text-white">
                        R$ {s.valor.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-300">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {s.tipo_chave_pix}
                        </span>
                        {s.chave_pix}
                      </TableCell>
                      <TableCell>
                        {s.status === "pago" ? (
                          <Badge className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 flex items-center w-fit gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Pago via PIX
                          </Badge>
                        ) : s.status === "rejeitado" ? (
                          <Badge className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 flex items-center w-fit gap-1">
                            <AlertCircle className="w-3 h-3" /> Rejeitado
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 flex items-center w-fit gap-1">
                            <Clock className="w-3 h-3" /> Aguardando Transferência
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500">
                        {s.pago_em ? new Date(s.pago_em).toLocaleDateString("pt-BR") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE SOLICITAÇÃO DE SAQUE PIX */}
      <Dialog open={modalSaqueAberto} onOpenChange={setModalSaqueAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
              Solicitar Saque de Comissões via PIX
            </DialogTitle>
            <DialogDescription>
              O valor será debitado do seu saldo e transferido manualmente pelo administrador para a
              sua chave PIX informada.
            </DialogDescription>
          </DialogHeader>

          {erroSaque && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erroSaque}</span>
            </div>
          )}

          {sucessoSaque && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{sucessoSaque}</span>
            </div>
          )}

          <form onSubmit={handleSolicitarSaque} className="space-y-4 py-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="valorSaque">Valor do Saque (R$)</Label>
                <span className="text-xs text-slate-400">
                  Disponível: <strong>R$ {data.saldo_disponivel.toFixed(2)}</strong>
                </span>
              </div>
              <Input
                id="valorSaque"
                type="number"
                step="0.01"
                min={data.saque_minimo}
                max={data.saldo_disponivel}
                value={valorSaque}
                onChange={(e) => setValorSaque(e.target.value)}
                placeholder="50.00"
                required
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Valor mínimo para saque: R$ {data.saque_minimo.toFixed(2)}
              </span>
            </div>

            <div>
              <Label htmlFor="tipoChavePix">Tipo de Chave PIX</Label>
              <select
                id="tipoChavePix"
                value={tipoChavePix}
                onChange={(e) => setTipoChavePix(e.target.value)}
                className="w-full mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="telefone">Telefone / Celular</option>
                <option value="aleatoria">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="chavePix">Sua Chave PIX</Label>
              <Input
                id="chavePix"
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="Insira sua chave PIX completa"
                required
                className="mt-1 font-mono text-sm"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalSaqueAberto(false)}
                disabled={solicitandoSaque}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={solicitandoSaque || data.saldo_disponivel < data.saque_minimo}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {solicitandoSaque ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                  </>
                ) : (
                  "Confirmar Solicitação de Saque"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
