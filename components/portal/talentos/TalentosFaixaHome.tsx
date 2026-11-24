"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import type { Talento } from "@/lib/talentos/types";

interface TalentosFaixaHomeProps {
  talentos?: Talento[];
}

export function TalentosFaixaHome({ talentos: initialTalentos }: TalentosFaixaHomeProps) {
  const [talentos, setTalentos] = useState<Talento[]>(initialTalentos || []);

  useEffect(() => {
    if (!initialTalentos || initialTalentos.length === 0) {
      fetch("/api/talentos")
        .then((res) => res.json())
        .then((data) => {
          if (data?.data && Array.isArray(data.data)) {
            setTalentos(data.data);
          }
        })
        .catch(() => {});
    }
  }, [initialTalentos]);

  return (
    <section className="my-6 rounded-3xl overflow-hidden bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-amber-300/70 dark:border-amber-800 shadow-md p-6 sm:p-8 relative">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Talentos & Celebridades Empire</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Conecte sua marca aos maiores apresentadores e influenciadores do Brasil
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Comerciais de TV, campanhas digitais, presença VIP, palestras corporativas e cerimoniais.
            Consulte nosso catálogo exclusivo de profissionais e solicite uma proposta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 shrink-0">
          {/* Mini Avatars dos Talentos (exibidos automaticamente) */}
          {talentos.length > 0 && (
            <div className="flex items-center -space-x-3 overflow-hidden p-1">
              {talentos.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="relative w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-md bg-slate-200 dark:bg-slate-800"
                  title={t.nome}
                >
                  <Image
                    src={t.foto_url}
                    alt={t.nome}
                    fill
                    unoptimized
                    className="object-cover"
                    style={{
                      objectPosition: `center ${
                        t.foto_posicao_y !== undefined && t.foto_posicao_y !== null
                          ? t.foto_posicao_y
                          : t.redes_sociais?.foto_posicao_y ?? 25
                      }%`,
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <Link
            href="/talentos"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-transform hover:scale-105 active:scale-95 text-center cursor-pointer"
          >
            <span>Ver Todos os Talentos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
