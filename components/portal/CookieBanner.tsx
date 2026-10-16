"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Cookie, Settings2, Check } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [marketingCookies, setMarketingCookies] = useState(true);
  const [analyticsCookies, setAnalyticsCookies] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem("portal_empire_cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      "portal_empire_cookie_consent",
      JSON.stringify({
        essential: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString(),
      })
    );
    setShow(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(
      "portal_empire_cookie_consent",
      JSON.stringify({
        essential: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
      })
    );
    setShow(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(
      "portal_empire_cookie_consent",
      JSON.stringify({
        essential: true,
        analytics: analyticsCookies,
        marketing: marketingCookies,
        timestamp: new Date().toISOString(),
      })
    );
    setShow(false);
    setShowSettings(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl pointer-events-auto backdrop-blur-md">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  Privacidade e Cookies (LGPD)
                </h3>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Utilizamos cookies e tecnologias similares para personalizar conteúdo, medir a audiência e exibir anúncios relevantes. Ao continuar navegando, você concorda com a nossa{" "}
                  <Link href="/privacidade" className="text-primary font-semibold hover:underline">
                    Política de Privacidade
                  </Link>{" "}
                  e{" "}
                  <Link href="/termos" className="text-primary font-semibold hover:underline">
                    Termos de Uso
                  </Link>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="text-xs gap-1.5 h-9"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Preferências
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptEssential}
                className="text-xs h-9"
              >
                Apenas Necessários
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs gap-1.5 h-9 shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                Aceitar Todos
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Preferências de Privacidade e Consentimento
              </h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Voltar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Cookies Essenciais (Obrigatórios)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Necessários para o funcionamento básico, segurança e sessões de autenticação do portal.
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                  Sempre Ativos
                </span>
              </div>

              <div className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Cookies de Métricas e Performance
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Permitem contabilizar visualizações de matérias e métricas anônimas de leitura.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsCookies}
                  onChange={(e) => setAnalyticsCookies(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 mt-1"
                />
              </div>

              <div className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Cookies de Publicidade e Anúncios
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Utilizados para auditar impressões e cliques em campanhas de anunciantes parceiros.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={marketingCookies}
                  onChange={(e) => setMarketingCookies(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="text-xs h-8"
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSavePreferences} className="text-xs h-8">
                Salvar Minhas Preferências
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
