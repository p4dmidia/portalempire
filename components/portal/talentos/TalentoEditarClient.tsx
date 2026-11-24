"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  UserCheck,
  LogOut,
} from "lucide-react";
import type { Talento } from "@/lib/talentos/types";
import { TalentoCadastroWizard } from "./TalentoCadastroWizard";

export function TalentoEditarClient() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Sessão de Edição
  const [talentoLogado, setTalentoLogado] = useState<Talento | null>(null);
  const [tokenEdicao, setTokenEdicao] = useState<string | null>(null);

  const handleAcessarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !whatsapp.trim()) {
      setErroMsg("Informe seu e-mail e WhatsApp de cadastro.");
      return;
    }

    try {
      setCarregando(true);
      setErroMsg(null);

      const res = await fetch("/api/talentos/acesso-edicao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), whatsapp: whatsapp.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.talento || !data.token) {
        throw new Error(data.error || "Credenciais não encontradas.");
      }

      setTalentoLogado(data.talento);
      setTokenEdicao(data.token);
    } catch (err: unknown) {
      setErroMsg(
        err instanceof Error
          ? err.message
          : "Nenhum perfil encontrado com este e-mail e telefone. Verifique se os dados digitados são os mesmos do cadastro."
      );
    } finally {
      setCarregando(false);
    }
  };

  const handleSair = () => {
    setTalentoLogado(null);
    setTokenEdicao(null);
    setEmail("");
    setWhatsapp("");
    setErroMsg(null);
  };

  // Se já autenticou com e-mail e WhatsApp: exibe a tela de edição em modo Live Studio
  if (talentoLogado && tokenEdicao) {
    return (
      <div>
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              Editando perfil de: <strong className="text-white">{talentoLogado.nome}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleSair}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da Edição</span>
          </button>
        </div>

        <TalentoCadastroWizard
          talentoInicial={talentoLogado}
          tokenEdicao={tokenEdicao}
          modoEdicao={true}
          onSucessoEdicao={(atualizado) => setTalentoLogado(atualizado)}
        />
      </div>
    );
  }

  // Se não autenticou: exibe a tela de login simples com E-mail + WhatsApp
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <Link
          href="/talentos"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 font-bold transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Catálogo de Elenco</span>
        </Link>

        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-400/40 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          Gerenciar Meu Perfil
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
          Informe seu e-mail e WhatsApp de cadastro para acessar a tela de edição do seu perfil, ajustar suas fotos e dados.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200/90 rounded-3xl shadow-sm space-y-6">
          {erroMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{erroMsg}</span>
            </div>
          )}

          <form onSubmit={handleAcessarPerfil} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>Seu E-mail Cadastrado</span>
              </label>
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Seu WhatsApp de Cadastro</span>
              </label>
              <input
                type="tel"
                required
                placeholder="(34) 99999-9999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Com ou sem DDD / traço. O sistema reconhece automaticamente.
              </span>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {carregando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando Acesso...</span>
                </>
              ) : (
                <>
                  <span>Acessar Meu Perfil</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Ainda não faz parte do elenco oficial?{" "}
              <Link
                href="/talentos/cadastro"
                className="text-amber-600 hover:text-amber-700 font-bold underline"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
