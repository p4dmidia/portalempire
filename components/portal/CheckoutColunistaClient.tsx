"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CidadeData } from "@/lib/portal/queries";
import {
  CheckCircle2,
  ShieldCheck,
  QrCode,
  CreditCard,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Megaphone,
  Users,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface CheckoutColunistaClientProps {
  cidades: CidadeData[];
  refCode: string;
  cidadeInicialSlug: string;
}

function formatarCpfCnpj(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 14);
  if (digitos.length <= 11) {
    return digitos
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digitos
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 7) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function CheckoutColunistaClient({
  cidades,
  refCode,
  cidadeInicialSlug,
}: CheckoutColunistaClientProps) {
  const router = useRouter();

  const cidadeInicialObj = cidades.find((c) => c.slug === cidadeInicialSlug);

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [cidadeId, setCidadeId] = useState(cidadeInicialObj?.id || cidades[0]?.id || "");
  const [nomeColuna, setNomeColuna] = useState("");
  const [nomeColunaEditado, setNomeColunaEditado] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codigoRef, setCodigoRef] = useState(refCode || "");
  const [showPassword, setShowPassword] = useState(false);

  // Método de pagamento: 'pix' (Transparente na tela) ou 'cartao' (Checkout Pro MP)
  const [metodoPagamento, setMetodoPagamento] = useState<"pix" | "cartao">("pix");

  // Estados do fluxo de pagamento
  const [etapa, setEtapa] = useState<"formulario" | "pix_aguardando" | "aprovado">("formulario");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dados do PIX gerado
  const [colunistaId, setColunistaId] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");
  const [ticketUrl, setTicketUrl] = useState<string>("");
  const [copiado, setCopiado] = useState(false);

  // Sugerir automaticamente o nome da coluna conforme o nome da pessoa
  useEffect(() => {
    if (!nomeColunaEditado && nome.trim().length >= 3) {
      setNomeColuna(`Coluna ${nome.trim()}`);
    }
  }, [nome, nomeColunaEditado]);

  // Função para finalizar e enviar para /login após pagamento aprovado
  const concluirERedirecionarLogin = useCallback(async () => {
    setEtapa("aprovado");
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignora erro de signOut
    }

    setTimeout(() => {
      router.push(
        `/login?pagamento=aprovado&email=${encodeURIComponent(
          email.trim().toLowerCase()
        )}&redirect=/painel/colunista/dashboard`
      );
    }, 2500);
  }, [email, router]);

  // Polling automático a cada 3.5s enquanto aguarda o pagamento PIX
  useEffect(() => {
    if (etapa !== "pix_aguardando" || !paymentId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/checkout/colunista/status?paymentId=${encodeURIComponent(
            paymentId
          )}&colunistaId=${encodeURIComponent(colunistaId)}&cidadeId=${encodeURIComponent(
            cidadeId
          )}&nomeColuna=${encodeURIComponent(nomeColuna)}`
        );
        const data = await res.json();
        if (data?.aprovado) {
          clearInterval(interval);
          concluirERedirecionarLogin();
        }
      } catch {
        // Silencioso durante polling
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [etapa, paymentId, colunistaId, cidadeId, nomeColuna, concluirERedirecionarLogin]);

  const verificarPagamentoManual = async () => {
    if (!paymentId) return;
    setIsCheckingStatus(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/checkout/colunista/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          colunistaId,
          cidadeId,
          nomeColuna,
          telefone,
          cpfCnpj,
        }),
      });
      const data = await res.json();
      if (data?.aprovado) {
        await concluirERedirecionarLogin();
      } else {
        setErrorMessage(
          "Ainda estamos aguardando a confirmação do Banco Central / Mercado Pago. Assim que o PIX for compensado, sua conta será liberada automaticamente!"
        );
      }
    } catch {
      setErrorMessage("Não foi possível consultar o status agora. Tente novamente em instantes.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCopiarPix = async () => {
    if (!qrCode) return;
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleMudarParaCartao = async () => {
    if (!colunistaId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/checkout/colunista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colunistaId,
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          telefone,
          cpfCnpj,
          cidadeId: cidadeId || null,
          nomeColuna: nomeColuna.trim() || `Coluna ${nome.trim()}`,
          codigoRef: codigoRef.trim() || null,
          metodoPagamento: "cartao",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao abrir checkout de cartão.");
      }
      if (data.initPoint) {
        window.location.href = data.initPoint;
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Erro ao redirecionar.");
      setIsLoading(false);
    }
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (nome.trim().length < 3) {
      setErrorMessage("Informe seu nome completo.");
      return;
    }
    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo.includes("@") || !emailLimpo.includes(".")) {
      setErrorMessage("Informe um e-mail profissional válido.");
      return;
    }
    const docNumeros = cpfCnpj.replace(/\D/g, "");
    if (docNumeros.length !== 11 && docNumeros.length !== 14) {
      setErrorMessage(
        "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido para emissão do pagamento."
      );
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Sua senha de acesso deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("A confirmação de senha não coincide com a senha digitada.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const refLimpo = codigoRef.trim();
      const colunaFinal = nomeColuna.trim() || `Coluna ${nome.trim()}`;

      let userId = colunistaId;

      if (!userId) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: emailLimpo,
          password,
          options: {
            data: {
              nome: nome.trim(),
              telefone,
              cpf_cnpj: cpfCnpj,
              cidade_id: cidadeId || null,
              nome_coluna: colunaFinal,
              ref: refLimpo || undefined,
            },
          },
        });

        if (signUpError) {
          if (
            signUpError.message.includes("already registered") ||
            signUpError.message.includes("already exists")
          ) {
            const { data: signInData, error: signInError } =
              await supabase.auth.signInWithPassword({
                email: emailLimpo,
                password,
              });

            if (signInError || !signInData.user) {
              throw new Error(
                "Este e-mail já está cadastrado. Verifique se digitou sua senha correta ou acesse a tela de Login."
              );
            }
            userId = signInData.user.id;
          } else {
            throw new Error(signUpError.message);
          }
        } else if (signUpData.user) {
          userId = signUpData.user.id;
        }
      }

      if (!userId) {
        throw new Error("Não foi possível inicializar seu cadastro de colunista.");
      }

      setColunistaId(userId);

      const res = await fetch("/api/checkout/colunista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colunistaId: userId,
          nome: nome.trim(),
          email: emailLimpo,
          telefone,
          cpfCnpj,
          cidadeId: cidadeId || null,
          nomeColuna: colunaFinal,
          codigoRef: refLimpo || null,
          metodoPagamento,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao comunicar com o Mercado Pago.");
      }

      if (metodoPagamento === "cartao" && data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }

      setPaymentId(data.paymentId);
      setQrCode(data.qrCode || "");
      setQrCodeBase64(data.qrCodeBase64 || "");
      setTicketUrl(data.ticketUrl || "");
      setEtapa("pix_aguardando");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Ocorreu um erro ao iniciar o checkout.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Topo de navegação */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <Link
            href="/seja-colunista"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para informações da licença
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Ambiente Seguro · Mercado Pago Oficial
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUNA ESQUERDA: ETAPAS DO CHECKOUT (FUNDO BRANCO) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg">
            {/* Indicador de Progresso */}
            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
              <div
                className={`flex items-center gap-2 ${
                  etapa === "formulario" ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    etapa === "formulario"
                      ? "bg-amber-400 text-slate-950"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {etapa === "formulario" ? "1" : "✓"}
                </span>
                <span>1. Conta & Coluna</span>
              </div>
              <div className="h-px flex-1 bg-slate-200" />
              <div
                className={`flex items-center gap-2 ${
                  etapa === "pix_aguardando"
                    ? "text-amber-600"
                    : etapa === "aprovado"
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    etapa === "pix_aguardando"
                      ? "bg-amber-400 text-slate-950"
                      : etapa === "aprovado"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {etapa === "aprovado" ? "✓" : "2"}
                </span>
                <span>2. Pagamento</span>
              </div>
              <div className="h-px flex-1 bg-slate-200" />
              <div
                className={`flex items-center gap-2 ${
                  etapa === "aprovado" ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    etapa === "aprovado"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  3
                </span>
                <span>3. Escritório Liberado</span>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ETAPA 1: FORMULÁRIO DE DADOS + ESCOLHA DE PAGAMENTO */}
            {etapa === "formulario" && (
              <form onSubmit={handleSubmitCheckout} className="space-y-5">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">
                    Crie sua Conta de Colunista & Ative sua Licença
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Preencha seus dados abaixo. Assim que o pagamento for confirmado, sua conta e sua coluna já serão ativadas automaticamente.
                  </p>
                </div>

                {codigoRef && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Indicação ativa vinculada ao código:{" "}
                      <strong className="text-amber-800 uppercase">{codigoRef}</strong>
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: João Carlos da Silva"
                      className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      E-mail de Acesso (Seu Login) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com.br"
                      className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      WhatsApp / Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={telefone}
                      onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      CPF ou CNPJ (Para emissão do PIX/NF) *
                    </label>
                    <input
                      type="text"
                      required
                      value={cpfCnpj}
                      onChange={(e) => setCpfCnpj(formatarCpfCnpj(e.target.value))}
                      placeholder="000.000.000-00"
                      className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Cidade Principal de Cobertura *
                    </label>
                    <select
                      value={cidadeId}
                      onChange={(e) => setCidadeId(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">Cobertura Regional / Multi-cidades</option>
                      {cidades.map((cid) => (
                        <option key={cid.id} value={cid.id}>
                          {cid.nome} - {cid.uf}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nome da sua Coluna no Portal *
                    </label>
                    <input
                      type="text"
                      required
                      value={nomeColuna}
                      onChange={(e) => {
                        setNomeColuna(e.target.value);
                        setNomeColunaEditado(true);
                      }}
                      placeholder="Ex: Coluna João Silva — Política & Negócios"
                      className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Você poderá alterar o nome, foto e descrição da sua coluna a qualquer momento dentro do Escritório do Colunista.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Crie sua Senha de Acesso *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full h-11 px-4 pr-10 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Confirme sua Senha *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita sua senha"
                      className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Código do Colunista que te indicou (Opcional)
                    </label>
                    <input
                      type="text"
                      value={codigoRef}
                      onChange={(e) => setCodigoRef(e.target.value)}
                      placeholder="Se foi indicado por outro colunista, informe o código aqui"
                      className="w-full h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* SELETOR DE FORMA DE PAGAMENTO */}
                <div className="pt-4 border-t border-slate-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">
                    Escolha como prefere pagar sua assinatura (R$ 250,00/mês)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMetodoPagamento("pix")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                        metodoPagamento === "pix"
                          ? "bg-amber-50/70 border-amber-400 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          metodoPagamento === "pix"
                            ? "bg-amber-400 text-slate-950"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            PIX Imediato
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Na Tela
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          QR Code gerado aqui mesmo. Liberação do Escritório em segundos.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMetodoPagamento("cartao")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                        metodoPagamento === "cartao"
                          ? "bg-amber-50/70 border-amber-400 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          metodoPagamento === "cartao"
                            ? "bg-amber-400 text-slate-950"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            Cartão / Mercado Pago
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Pague com cartão de crédito ou saldo no ambiente do Mercado Pago.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Preparando seu Checkout Mercado Pago...
                    </>
                  ) : metodoPagamento === "pix" ? (
                    <>
                      <QrCode className="w-5 h-5" />
                      GERAR QR CODE PIX E CRIAR MINHA CONTA (R$ 250,00)
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      PAGAR COM CARTÃO NO MERCADO PAGO (R$ 250,00)
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500">
                  Já possui conta de colunista?{" "}
                  <Link href="/login" className="text-amber-600 font-bold hover:underline">
                    Fazer Login no Escritório
                  </Link>
                </p>
              </form>
            )}

            {/* ETAPA 2: QR CODE PIX GERADO NA TELA */}
            {etapa === "pix_aguardando" && (
              <div className="text-center space-y-6 py-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  Aguardando confirmação automática do pagamento...
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Escaneie o QR Code PIX para Ativar sua Conta
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 max-w-lg mx-auto">
                    Sua conta para <strong>{email}</strong> já foi pré-criada! Assim que você concluir o PIX de{" "}
                    <strong className="text-amber-700">R$ 250,00</strong>, seu acesso ao Escritório do Colunista será liberado na hora.
                  </p>
                </div>

                {/* QR Code Box */}
                <div className="bg-white p-5 rounded-3xl inline-block shadow-lg mx-auto border-4 border-amber-400">
                  {qrCodeBase64 ? (
                    <img
                      src={`data:image/png;base64,${qrCodeBase64}`}
                      alt="QR Code PIX Mercado Pago"
                      className="w-56 h-56 object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-800 p-4">
                      <QrCode className="w-20 h-20 text-slate-900 mb-2" />
                      <span className="text-xs font-semibold text-center">
                        Utilize o botão &quot;Copiar Código PIX&quot; abaixo no app do seu banco
                      </span>
                    </div>
                  )}
                </div>

                {/* Código Copia e Cola */}
                {qrCode && (
                  <div className="max-w-lg mx-auto space-y-2 text-left">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 text-center">
                      Ou pague com PIX Copia e Cola:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={qrCode}
                        className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleCopiarPix}
                        className="h-11 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shrink-0 flex items-center gap-1.5 transition-colors"
                      >
                        {copiado ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar PIX
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={verificarPagamentoManual}
                    disabled={isCheckingStatus}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    {isCheckingStatus ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando no Mercado Pago...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Já paguei! Liberar meu Escritório
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleMudarParaCartao}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    Prefere pagar com Cartão? Abrir Mercado Pago
                  </button>
                </div>

                {ticketUrl && (
                  <div>
                    <a
                      href={ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 underline"
                    >
                      Abrir comprovante / link externo no Mercado Pago
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ETAPA 3: PAGAMENTO APROVADO -> REDIRECIONANDO PARA LOGIN */}
            {etapa === "aprovado" && (
              <div className="text-center py-10 space-y-5">
                <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
                    Pagamento Aprovado · Conta Ativada
                  </span>
                  <h2 className="text-3xl font-black text-slate-900">
                    Parabéns, novo Colunista Empire!
                  </h2>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Sua assinatura foi confirmada e sua coluna já está ativa. Estamos redirecionando você para a tela de Login para entrar no seu{" "}
                    <strong className="text-amber-700">Escritório do Colunista</strong>...
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/login?pagamento=aprovado&email=${encodeURIComponent(
                      email.trim().toLowerCase()
                    )}&redirect=/painel/colunista/dashboard`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg"
                  >
                    Acessar Tela de Login Agora
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: RESUMO DO PLANO E GARANTIAS (FUNDO BRANCO) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-7 shadow-lg">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                    Resumo da Assinatura
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    Licença Colunista Oficial
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-600">R$ 250,00</div>
                  <div className="text-[11px] text-slate-500">por mês</div>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">
                      Cobertura da sua Cidade ou Região
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Publique matérias, artigos e coberturas de eventos. Permitido mais de um colunista por cidade ou região.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Megaphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">
                      Venda Espaços Publicitários Locais
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Comercialize banners e publieditoriais na sua coluna e nas páginas da cidade para empresas locais.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-700">
                      R$ 50,00/mês de Recorrência por Indicado
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Receba link exclusivo de afiliado no seu painel e ganhe R$ 50,00 todo mês para cada colunista ativo indicado por você.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Licença Mensal Empire Cidades</span>
                  <span className="font-bold text-slate-900">R$ 250,00</span>
                </div>
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Taxa de Adesão / Implantação</span>
                  <span className="font-bold">GRÁTIS (R$ 0,00)</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>Total Hoje</span>
                  <span className="text-amber-600">R$ 250,00</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3.5">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                <div className="font-bold text-slate-900">
                  Liberação Automática via Mercado Pago
                </div>
                <p>
                  Processamento oficial integrado ao Mercado Pago. Assim que o pagamento é aprovado, sua conta é ativada e você é redirecionado direto para fazer login no Escritório do Colunista.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
