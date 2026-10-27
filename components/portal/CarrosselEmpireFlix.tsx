"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight, Tv } from "lucide-react";

interface ApresentadorEmpireFlix {
  id: string;
  nome: string;
  programa?: string;
  imagem: string;
  url: string;
}

const APRESENTADORES: ApresentadorEmpireFlix[] = [
  {
    id: "ana-paula-saad",
    nome: "Ana Paula Saad",
    programa: "EmpireFlix Original",
    imagem: "/imagens/ana paula.avif",
    url: "https://www.empireflixvip.com/ana-paula-saad",
  },
  {
    id: "cris-arcangeli",
    nome: "Cris Arcangeli",
    programa: "Inovação & Negócios",
    imagem: "/imagens/cris.avif",
    url: "https://www.empireflixvip.com/cris-arcangeli",
  },
  {
    id: "franciele-cunha",
    nome: "Franciele Cunha",
    programa: "EmpireFlix Original",
    imagem: "/imagens/franciele.avif",
    url: "https://www.empireflixvip.com/franciele-cunha",
  },
  {
    id: "kamilla-salgado",
    nome: "Kamilla Salgado",
    programa: "Lifestyle & Família",
    imagem: "/imagens/kamila.avif",
    url: "https://www.empireflixvip.com/kamilla-salgado",
  },
  {
    id: "kerolay-chaves",
    nome: "Kerolay Chaves",
    programa: "Rio Radical",
    imagem: "/imagens/karoline.avif",
    url: "https://www.empireflixvip.com/rio-radical",
  },
  {
    id: "leandro-d-ambrosio",
    nome: "Leandro d'Ambrosio",
    programa: "EmpireFlix Original",
    imagem: "/imagens/leandro.avif",
    url: "https://www.empireflixvip.com/leandro-d-ambrosio",
  },
  {
    id: "marcia-boscardin",
    nome: "Marcia Boscardin",
    programa: "Estilo & Cultura",
    imagem: "/imagens/marcia.avif",
    url: "https://www.empireflixvip.com/marcia-boscardin",
  },
  {
    id: "renata-dias",
    nome: "Renata Dias",
    programa: "EmpireFlix Original",
    imagem: "/imagens/renata.avif",
    url: "https://www.empireflixvip.com/renata-dias",
  },
  {
    id: "ricardo-cattani",
    nome: "Ricardo Cattani",
    programa: "Entrevistas Exclusivas",
    imagem: "/imagens/ricardo.avif",
    url: "https://www.empireflixvip.com/ricardo-cattani",
  },
  {
    id: "riv-melo",
    nome: "Riv Melo",
    programa: "Talk Show & Entretenimento",
    imagem: "/imagens/riv melo.avif",
    url: "https://www.empireflixvip.com/riv-melo",
  },
  {
    id: "silvania-cordeiro",
    nome: "Silvânia Cordeiro",
    programa: "EmpireFlix Original",
    imagem: "/imagens/silvania.avif",
    url: "https://www.empireflixvip.com/silvania-cordeiro",
  },
];

export function CarrosselEmpireFlix() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Rolagem automática a cada 5 segundos com pausa inteligente no hover
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const scrollStep = clientWidth > 768 ? 440 : 260;

      if (scrollLeft + scrollStep >= maxScroll - 20) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: scrollStep, behavior: "smooth" });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered]);

  const rolar = (direcao: "esquerda" | "direita") => {
    if (!scrollRef.current) return;
    const clientWidth = scrollRef.current.clientWidth;
    const scrollStep = clientWidth > 768 ? 440 : 260;
    const deslocamento = direcao === "esquerda" ? -scrollStep : scrollStep;
    scrollRef.current.scrollBy({ left: deslocamento, behavior: "smooth" });
  };

  return (
    <section className="my-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 md:p-8 shadow-sm relative overflow-hidden">
      {/* Luz ambiente sutil de fundo */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho da Seção Estilo Netflix */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="bg-[#e50914] text-white text-[11px] font-black tracking-widest px-2.5 py-0.5 rounded uppercase shadow-sm flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" /> EMPIREFLIX
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Apresentadores & Programas
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Catálogo de Estrelas da EmpireFlix
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Clique na capa para assistir aos episódios e conteúdos exclusivos de cada apresentador
          </p>
        </div>

        {/* Botões de Navegação Manual */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => rolar("esquerda")}
            aria-label="Rolar para esquerda"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-[#e50914] text-slate-700 hover:text-white dark:bg-slate-800 dark:hover:bg-[#e50914] dark:text-slate-200 flex items-center justify-center transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 shadow-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => rolar("direita")}
            aria-label="Rolar para direita"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-[#e50914] text-slate-700 hover:text-white dark:bg-slate-800 dark:hover:bg-[#e50914] dark:text-slate-200 flex items-center justify-center transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 shadow-xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Trilho de Cards Estilo Netflix */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-4 pt-2 -mx-2 px-2 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {APRESENTADORES.map((apresentador) => (
          <a
            key={apresentador.id}
            href={apresentador.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-none w-[170px] sm:w-[200px] md:w-[220px] aspect-[2/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-[#e50914] relative shadow-md hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] flex flex-col justify-end"
          >
            {/* Foto de Capa do Apresentador */}
            <Image
              src={apresentador.imagem}
              alt={apresentador.nome}
              fill
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 640px) 170px, (max-width: 768px) 200px, 220px"
            />

            {/* Selo Netflix / EmpireFlix no Topo da Capa */}
            <div className="absolute top-3 left-3 z-20">
              <span className="bg-[#e50914] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-lg backdrop-blur-sm">
                ORIGINAL
              </span>
            </div>

            {/* Gradiente Escuro Cinematográfico */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/45 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

            {/* Conteúdo sobre o Pôster */}
            <div className="relative z-20 p-3.5 sm:p-4 space-y-1.5 flex flex-col justify-end">
              {apresentador.programa && (
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block drop-shadow-sm">
                  {apresentador.programa}
                </span>
              )}

              <h3 className="text-white font-black text-sm sm:text-base leading-tight drop-shadow-md group-hover:text-red-400 transition-colors line-clamp-2">
                {apresentador.nome}
              </h3>

              {/* Botão de Ação "Assistir" Estilo Netflix */}
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white bg-white/20 group-hover:bg-[#e50914] backdrop-blur-md px-3 py-1 rounded-full transition-all duration-200 shadow-sm">
                  <Play className="w-3 h-3 fill-white" />
                  <span>Assistir</span>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
