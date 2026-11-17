"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PixConfigDialog } from "@/components/painel/financeiro/pix-config-dialog";
import { SolicitarSaqueDialog } from "@/components/painel/financeiro/solicitar-saque-dialog";
import {
  Users,
  TrendingUp,
  Percent,
  CheckCircle2,
  Search,
  QrCode,
  ArrowUpRight,
  Clock,
  Sparkles,
  Megaphone,
  CreditCard,
  Building2,
  FileText,
} from "lucide-react";

export interface SeguidorItem {
  id: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  plano_trial: boolean;
  status: string;
  created_at: string;
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

interface ColunistaFinanceiroViewProps {
  initialSeguidores: SeguidorItem[];
  initialSaques: SaqueItem[];
  userProfile: {
    id: string;
    nome: string;
    email: string;
    cpf_cnpj: string | null;
    telefone: string | null;
    chave_pix: string | null;
    tipo_chave_pix: string | null;
    saldo_afiliado: number;
  };
  colunaNome?: string;
  mensalidadeValor: number;
  percentualColunista: number;
  percentualPlataforma: number;
  saqueMinimo: number;
}

export function ColunistaFinanceiroView({
  initialSeguidores,
  initialSaques,
  userProfile,
  colunaNome,
  mensalidadeValor,
  percentualColunista,
  percentualPlataforma,
  saqueMinimo,
}: ColunistaFinanceiroViewProps) {
  const [seguidores] = useState<SeguidorItem[]>(initialSeguidores);
  const [saques, setSaques] = useState<SaqueItem[]>(initialSaques);
  const [busca, setBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<"assinantes" | "saques">("assinantes");

  const [modalPixAberto, setModalPixAberto] = useState(false);
  const [modalSaqueAberto, setModalSaqueAberto] = useState(false);

  const [chavePix, setChavePix] = useState<string | null>(
    userProfile.chave_pix
  );
  const [tipoChavePix, setTipoChavePix] = useState<string | null>(
    userProfile.tipo_chave_pix
  );
  const [saldoDisponivel, setSaldoDisponivel] = useState<number>(
    userProfile.saldo_afiliado || 0
  );

  // --------------------------------------------------------------------------
  // CÁLCULOS FINANCEIROS DAS ASSINATURAS DA COLUNA (60% / 40%)
  // --------------------------------------------------------------------------
  const totalAssinantes = seguidores.length;
  const assinantesAtivos = seguidores.filter((s) => s.status === "ativo").length;

  const valorPorAssinante = mensalidadeValor; // R$ 9,90
  const receitaBrutaTotal = assinantesAtivos * valorPorAssinante;
  const valorColunistaPorAssinante = valorPorAssinante * (percentualColunista / 100); // R$ 5,94
  const participacaoMensalLiquida = assinantesAtivos * valorColunistaPorAssinante;
  const taxaPlataformaTotal = receitaBrutaTotal * (percentualPlataforma / 100);

  // Histórico de saques
  const totalPago = saques
    .filter((s) => s.status === "pago")
    .reduce((acc, s) => acc + Number(s.valor), 0);

  const totalPendente = saques
    .filter((s) => s.status === "pendente")
    .reduce((acc, s) => acc + Number(s.valor), 0);

  // Filtro de assinantes
  const seguidoresFiltrados = seguidores.filter((s) => {
    const termo = busca.toLowerCase();
    const nome = s.nome?.toLowerCase() || "";
    const email = s.email?.toLowerCase() || "";
    const whats = s.whatsapp || "";
    return nome.includes(termo) || email.includes(termo) || whats.includes(termo);
  });

  const handlePixSalvo = (novaChave: string, novoTipo: string) => {
    setChavePix(novaChave);
    setTipoChavePix(novoTipo);
  };

  const handleSaqueSucesso = (novoS掛け: unknown, novoSaldo: number) => {
    if (novoS掛け) {
      setSaques([novoS掛け as SaqueItem, ...saques]);
    }
    setSaldoDisponivel(novoSaldo);
    setAbaAtiva("saques");
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Financeiro & Assinaturas da Coluna
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Acompanhe as mensalidades dos assinantes que seguem sua coluna {colunaNome ? `"${colunaNome}"` : ""}, seus repasses de 60% e sua chave PIX.
          </p>
        </div>
        <Button
          variant={chavePix ? "outline" : "default"}
          onClick={() => setModalPixAberto(true)}
          className="flex items-center gap-2"
        >
          <QrCode className="h-4 w-4 text-primary" />
          {chavePix ? "Alterar Chave PIX" : "Cadastrar Chave PIX"}
        </Button>
      </div>

      {/* Banner de status da Chave PIX */}
      {chavePix ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-950 dark:text-emerald-200">
                Chave PIX Cadastrada (Pronto para Recebimento de Repasses)
              </p>
              <p className="text-xs opacity-90 font-mono mt-0.5">
                Tipo: <span className="uppercase font-bold">{tipoChavePix}</span> • Chave: <span className="font-bold">{chavePix}</span>
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setModalPixAberto(true)}
            className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 self-start sm:self-auto"
          >
            Editar Chave
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <QrCode className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-950 dark:text-amber-100">
                Você ainda não cadastrou sua Chave PIX
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                Cadastre sua chave PIX para que o portal possa transferir sua participação de 60% nas mensalidades dos seus assinantes.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setModalPixAberto(true)}
            className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white self-start sm:self-auto"
          >
            Cadastrar Chave PIX
          </Button>
        </div>
      )}

      {/* Regras Claras de Monetização do Portal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            Assinaturas da Coluna (Repasse de 60%)
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cada leitor que assina e acompanha sua coluna paga uma mensalidade de <strong>R$ {valorPorAssinante.toFixed(2)}/mês</strong>. 
            Deste valor, <strong>60% é seu (R$ {valorColunistaPorAssinante.toFixed(2)}/mês por assinante)</strong> e 40% é retido pela Empire Cidades para custos de infraestrutura e distribuição.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Megaphone className="w-4 h-4" />
            Anúncios e Banners na Coluna (100% Seu)
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Todo banner ou publicidade que você vende dentro da sua coluna é <strong>100% seu</strong>. Você negocia e cobra diretamente do anunciante por fora. 
            A Empire Cidades <strong>não cobra nenhuma comissão</strong> sobre seus anúncios e não gerencia esses pagamentos.
          </p>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Sua Parte Mensal (60%)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200">
            R$ {participacaoMensalLiquida.toFixed(2)}
            <span className="text-xs font-normal text-muted-foreground ml-1">/mês</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            Líquido mensal dos seus {assinantesAtivos} assinantes ativos
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total de Assinantes
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalAssinantes}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Leitores que favoritaram sua coluna
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Receita Bruta Total
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            R$ {receitaBrutaTotal.toFixed(2)}
            <span className="text-xs font-normal text-muted-foreground ml-1">/mês</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            Total bruto arrecadado pelas mensalidades
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Taxa da Plataforma (40%)
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            R$ {taxaPlataformaTotal.toFixed(2)}
            <span className="text-xs font-normal text-muted-foreground ml-1">/mês</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            40% retido para infraestrutura do portal
          </p>
        </div>
      </div>

      {/* Card de Saldo Disponível para Saque e Histórico */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Saldo Disponível para Saque
          </span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            R$ {saldoDisponivel.toFixed(2)}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span>
              Total já repassado: <strong className="text-slate-700 dark:text-slate-300">R$ {totalPago.toFixed(2)}</strong>
            </span>
            {totalPendente > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                • Em processamento: R$ {totalPendente.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => setModalSaqueAberto(true)}
          disabled={saldoDisponivel < saqueMinimo}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md disabled:opacity-50"
        >
          <ArrowUpRight className="w-5 h-5" />
          Solicitar Saque via PIX
        </Button>
      </div>

      {/* Navegação entre Abas */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setAbaAtiva("assinantes")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            abaAtiva === "assinantes"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Assinantes da Coluna ({totalAssinantes})
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("saques")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            abaAtiva === "saques"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Clock className="w-4 h-4" />
          Histórico de Repasses e Saques PIX ({saques.length})
        </button>
      </div>

      {/* Conteúdo da Aba 1: Assinantes */}
      {abaAtiva === "assinantes" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou WhatsApp..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Leitor / Assinante</TableHead>
                  <TableHead className="text-xs">Contato (WhatsApp)</TableHead>
                  <TableHead className="text-xs">Data de Adesão</TableHead>
                  <TableHead className="text-xs">Modalidade</TableHead>
                  <TableHead className="text-xs text-right">Mensalidade</TableHead>
                  <TableHead className="text-xs text-right text-emerald-600 dark:text-emerald-400 font-bold">
                    Sua Parte (60%)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seguidoresFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-muted-foreground text-sm"
                    >
                      {busca
                        ? "Nenhum assinante encontrado para a busca informada."
                        : "Sua coluna ainda não possui assinantes inscritos. Compartilhe o link da sua coluna para conquistar seus primeiros leitores!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  seguidoresFiltrados.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-xs">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {s.nome}
                          </p>
                          {s.email && (
                            <p className="text-[11px] text-muted-foreground">
                              {s.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {s.whatsapp || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {s.plano_trial ? (
                          <Badge variant="outline" className="text-[11px] border-primary/30 text-primary">
                            Trial 90 Dias
                          </Badge>
                        ) : (
                          <Badge className="text-[11px] bg-emerald-600">
                            Assinatura Ativa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        R$ {valorPorAssinante.toFixed(2)}/mês
                      </TableCell>
                      <TableCell className="text-xs text-right font-bold text-emerald-600 dark:text-emerald-400">
                        R$ {valorColunistaPorAssinante.toFixed(2)}/mês
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 2: Saques PIX */}
      {abaAtiva === "saques" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Data da Solicitação</TableHead>
                  <TableHead className="text-xs">Valor do Saque</TableHead>
                  <TableHead className="text-xs">Chave PIX de Destino</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Data de Pagamento</TableHead>
                  <TableHead className="text-xs text-right">Comprovante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saques.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-muted-foreground text-sm"
                    >
                      Nenhuma solicitação de saque realizada até o momento.
                    </TableCell>
                  </TableRow>
                ) : (
                  saques.map((saque) => (
                    <TableRow key={saque.id}>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {new Date(saque.solicitado_em).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                        R$ {Number(saque.valor).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {saque.chave_pix}{" "}
                        <span className="text-[10px] text-muted-foreground uppercase font-sans">
                          ({saque.tipo_chave_pix})
                        </span>
                      </TableCell>
                      <TableCell>
                        {saque.status === "pago" ? (
                          <Badge className="bg-emerald-600 text-[11px]">
                            Pago via PIX
                          </Badge>
                        ) : saque.status === "pendente" ? (
                          <Badge className="bg-amber-500 text-[11px]">
                            Aguardando Transferência
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[11px]">
                            Rejeitado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {saque.pago_em
                          ? new Date(saque.pago_em).toLocaleString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {saque.comprovante ? (
                          <a
                            href={saque.comprovante}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Ver Comprovante
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Modal para Cadastrar / Alterar Chave PIX */}
      <PixConfigDialog
        open={modalPixAberto}
        onOpenChange={setModalPixAberto}
        userProfile={{
          nome: userProfile.nome,
          chave_pix: chavePix,
          tipo_chave_pix: tipoChavePix,
        }}
        onSuccess={handlePixSalvo}
      />

      {/* Modal para Solicitar Saque via PIX */}
      <SolicitarSaqueDialog
        open={modalSaqueAberto}
        onOpenChange={setModalSaqueAberto}
        saldoDisponivel={saldoDisponivel}
        saqueMinimo={saqueMinimo}
        chavePix={chavePix}
        tipoChavePix={tipoChavePix}
        onOpenPixDialog={() => setModalPixAberto(true)}
        onSuccess={handleSaqueSucesso}
      />
    </div>
  );
}
