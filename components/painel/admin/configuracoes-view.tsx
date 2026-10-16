"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Percent,
  UserPlus,
  Rss,
  Calendar,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";


export function ConfiguracoesView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  // Form states
  const [comissaoPadrao, setComissaoPadrao] = useState(20);
  const [autocadastroColunista, setAutocadastroColunista] = useState(true);
  const [aprovarColunasManual, setAprovarColunasManual] = useState(true);
  const [captacaoAtivaGlobal, setCaptacaoAtivaGlobal] = useState(true);
  const [captacaoArquivarDias, setCaptacaoArquivarDias] = useState(30);
  const [colunistaMensalidadeValor, setColunistaMensalidadeValor] = useState(97);
  const [afiliadosComissaoPercentual, setAfiliadosComissaoPercentual] = useState(20);
  const [afiliadosSaqueMinimo, setAfiliadosSaqueMinimo] = useState(50);
  const [captacaoReescritaAutomatica, setCaptacaoReescritaAutomatica] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState("");

  const carregarConfiguracoes = async () => {
    try {
      const res = await fetch("/api/admin/configuracoes");
      if (res.ok) {
        const json = await res.json();
        const c = json.configs || {};
        setComissaoPadrao(Number(c.comissao_padrao_percentual ?? 20));
        setAutocadastroColunista(Boolean(c.autocadastro_colunista ?? true));
        setAprovarColunasManual(Boolean(c.aprovar_colunas_manual ?? true));
        setCaptacaoAtivaGlobal(Boolean(c.captacao_ativa_global ?? true));
        setCaptacaoArquivarDias(Number(c.captacao_arquivar_dias ?? 30));
        setColunistaMensalidadeValor(Number(c.colunista_mensalidade_valor ?? 97));
        setAfiliadosComissaoPercentual(Number(c.afiliados_comissao_percentual ?? 20));
        setAfiliadosSaqueMinimo(Number(c.afiliados_saque_minimo ?? 50));
        setCaptacaoReescritaAutomatica(Boolean(c.captacao_reescrita_automatica ?? true));
        setGeminiApiKey(String(c.gemini_api_key ?? ""));
      }
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const handleSalvar = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    setSaving(true);
    setMensagem(null);

    try {
      const res = await fetch("/api/admin/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comissao_padrao_percentual: Number(comissaoPadrao),
          autocadastro_colunista: autocadastroColunista,
          aprovar_colunas_manual: aprovarColunasManual,
          captacao_ativa_global: captacaoAtivaGlobal,
          captacao_arquivar_dias: Number(captacaoArquivarDias),
          colunista_mensalidade_valor: Number(colunistaMensalidadeValor),
          afiliados_comissao_percentual: Number(afiliadosComissaoPercentual),
          afiliados_saque_minimo: Number(afiliadosSaqueMinimo),
          captacao_reescrita_automatica: captacaoReescritaAutomatica,
          gemini_api_key: geminiApiKey.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Erro ao salvar configurações.");
      }

      setMensagem({
        tipo: "sucesso",
        texto: "Configurações gerais atualizadas com sucesso!",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const text = err instanceof Error ? err.message : "Erro desconhecido.";
      setMensagem({ tipo: "erro", texto: text });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Configurações Gerais
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Defina parâmetros globais de comissões, moderação de equipe, captação RSS e regras de negócio.
          </p>
        </div>

        <Button
          onClick={handleSalvar}
          disabled={saving}
          size="sm"
          className="gap-1.5 shadow-sm"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      {/* Alerta */}
      {mensagem && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-start gap-3 border ${
            mensagem.tipo === "sucesso"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {mensagem.tipo === "sucesso" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          )}
          <div>
            <p className="font-semibold">{mensagem.tipo === "sucesso" ? "Sucesso" : "Erro"}</p>
            <p className="text-xs mt-0.5">{mensagem.texto}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSalvar} className="space-y-6">
        {/* Bloco 1: Financeiro & Comissão */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Percent className="w-4 h-4 text-emerald-500" />
            Comissões & Monetização
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Comissão Padrão da Plataforma (%)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={comissaoPadrao}
                  onChange={(e) => setComissaoPadrao(Number(e.target.value))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Percentual descontado de cada anúncio vendido em colunas de cidades para o split da plataforma.
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 1.2: Mensalidade de Colunistas & Programa de Afiliados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Percent className="w-4 h-4 text-blue-500" />
            Mensalidade de Colunistas & Programa de Afiliados
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Valor da Mensalidade da Coluna (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={colunistaMensalidadeValor}
                  onChange={(e) => setColunistaMensalidadeValor(Number(e.target.value))}
                  className="pl-9"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Valor mensal digitado cobrado para manter uma coluna de cidade ativa no portal.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Comissão Recorrente do Afiliado (%)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={afiliadosComissaoPercentual}
                  onChange={(e) => setAfiliadosComissaoPercentual(Number(e.target.value))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Percentual recorrente creditado no saldo do colunista indicador a cada mensalidade paga pelo indicado.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Valor Mínimo para Saque PIX (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={afiliadosSaqueMinimo}
                  onChange={(e) => setAfiliadosSaqueMinimo(Number(e.target.value))}
                  className="pl-9"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Saldo acumulado mínimo necessário para o colunista poder solicitar resgate via PIX.
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 2: Usuários e Moderação */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <UserPlus className="w-4 h-4 text-primary" />
            Cadastros & Moderação Editorial
          </h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autocadastroColunista}
                onChange={(e) => setAutocadastroColunista(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Permitir Autocadastro de Colunistas
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Quando ativo, novos usuários podem se cadastrar na página pública. Seu status inicial será &quot;Pendente&quot; até que um administrador aprove.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aprovarColunasManual}
                onChange={(e) => setAprovarColunasManual(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Aprovação Manual Obrigatória para Novas Colunas
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Quando ativo, colunas criadas por colunistas ficam com status &quot;Pendente&quot; até validação do administrador antes de irem ao ar.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Bloco 3: Captação RSS e Retenção */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Rss className="w-4 h-4 text-amber-500" />
            Captação RSS Automática & Retenção
          </h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={captacaoAtivaGlobal}
                onChange={(e) => setCaptacaoAtivaGlobal(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Captação Global Ativa (Master Switch)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Permite pausar ou ativar toda a rotina de importação de feeds RSS do portal de uma única vez.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="checkbox"
                checked={captacaoReescritaAutomatica}
                onChange={(e) => setCaptacaoReescritaAutomatica(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Reescrita Automática Anti-Plágio (Proteção Jurídica - Lei 9.610/98)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Quando ativo, cada notícia captada tem seu título, resumo e conteúdo automaticamente reescritos com estilo jornalístico próprio, mantendo a precisão factual e a citação legal da fonte.
                </span>
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Dias para Arquivar Matérias Captadas
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={captacaoArquivarDias}
                    onChange={(e) => setCaptacaoArquivarDias(Number(e.target.value))}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">dias</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Matérias captadas via RSS mais antigas que este período serão despublicadas pelo cron de limpeza.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Chave API Google Gemini (Opcional)
                </label>
                <Input
                  type="password"
                  placeholder="AIzaSy... (opcional)"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
                <p className="text-[11px] text-slate-500">
                  Se informada, a reescrita usará IA (Gemini 1.5 Flash). Se vazio, utiliza o motor algorítmico nativo de paráfrase do sistema sem custos.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="submit" disabled={saving} className="gap-2 shadow-md">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Salvando configurações..." : "Salvar Configurações Gerais"}
          </Button>
        </div>
      </form>
    </div>
  );
}
