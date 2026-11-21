import type { Metadata } from "next";
import { getPortalData } from "@/lib/portal/queries";
import {
  Users,
  Target,
  TrendingUp,
  Tv,
  Radio,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  ArrowRight,
  CheckCircle2,
  Monitor,
  Building2,
  MapPin,
  Tv2,
  Signal,
  Layers,
  MessageCircle,
} from "lucide-react";

export const revalidate = 86400;

// Configuração Oficial do Canal Comercial Direto no WhatsApp
const WHATSAPP_NUMERO = "553488676886";
const WHATSAPP_FORMATADO = "+55 (34) 8867-6886";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMERO}?text=Ol%C3%A1!%20Gostaria%20de%20receber%20a%20tabela%20comercial%20e%20anunciar%20no%20Ecossistema%20Empire%20Cidades.`;

export async function generateMetadata(): Promise<Metadata> {
  const portal = await getPortalData();
  return {
    title: `Mídia Kit & Publicidade — +30 Milhões de Views | ${portal?.nome || "Portal Empire"}`,
    description:
      "Anuncie no maior ecossistema integrado de comunicação regional do Brasil: Portal de Notícias, TV Aberta (SBT e Band), Totens OOH, TV Streaming, Rádio, Revistas e Colunistas de Elite.",
  };
}

// Cidades estratégicas com Totens Digitais OOH instalados
const CIDADES_TOTENS = [
  { regiao: "São Paulo (Capital & Grande SP)", cidades: ["São Paulo (Capital)", "Alphaville (Barueri / Santana de Parnaíba)", "Guarulhos", "Osasco", "Cotia"] },
  { regiao: "Interior de São Paulo", cidades: ["Sorocaba", "Bauru", "Marília", "Assis", "Ourinhos", "Dracena", "Flórida Paulista"] },
  { regiao: "Rio de Janeiro", cidades: ["Rio de Janeiro (Capital)", "Copacabana", "Búzios", "Arraial do Cabo"] },
  { regiao: "Paraná", cidades: ["Maringá", "Londrina", "Cianorte"] },
  { regiao: "Minas Gerais & Centro-Oeste", cidades: ["Belo Horizonte (MG)", "Goiânia (GO)", "Caldas Novas (GO)", "Brasília (DF)", "Cuiabá (MT)", "Campo Grande (MS)"] },
  { regiao: "Nordeste & Sudeste", cidades: ["Salvador (BA)", "Arraial d'Ajuda (BA)", "Teresina (PI)", "Espírito Santo (Vitória / Vila Velha)"] },
];

export default async function AnunciePage() {
  const portal = await getPortalData();

  return (
    <div className="space-y-20 max-w-6xl mx-auto pb-16">
      {/* Hero Comercial de Alto Impacto */}
      <section className="text-center space-y-6 pt-6 pb-12 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent text-amber-700 dark:text-amber-400 border border-amber-300/40 dark:border-amber-700/50 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Mídia Kit Oficial · Rede Integrada Multiplataforma</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Domine a Atenção de Mais de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600">
            30 Milhões
          </span>{" "}
          de Pessoas por Mês.
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          O <strong>{portal?.nome || "Portal Empire Cidades"}</strong> unifica todo o ecossistema de comunicação em um único canal publicitário: <strong>Portal de Notícias, TV Aberta Afiliada (SBT e Band), Rede Nacional de Totens Digitais OOH, TV Streaming, Rádio Web, Revistas e Colunistas de Elite</strong>. Coloque sua marca onde as decisões acontecem.
        </p>

        <div className="flex justify-center pt-2">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-emerald-600/25 transition-all hover:scale-105"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Falar no WhatsApp: {WHATSAPP_FORMATADO}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Grade de Métricas Poderosas */}
      <section className="space-y-4">
        <div className="text-center space-y-1 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Números que Comprovam a Liderança
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Alcance Massivo com Alta Qualificação de Público
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-400/50 transition-all">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              +30 Milhões
            </h3>
            <p className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-1">
              Visualizações Mensais Consolidadas
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Audiência viva e contínua em todo o ecossistema integrado: portal web, mobile, streaming de TV, áudio, revistas e totens OOH.
            </p>
          </div>

          <div className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-400/50 transition-all">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              +1.000.000
            </h3>
            <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-1">
              Impactos e Acessos Diários
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Giro permanente de leitores a cada segundo. Milhares de novos acessos e atualizações em tempo real 24 horas por dia.
            </p>
          </div>

          <div className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-400/50 transition-all">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <Tv2 className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              +6,6 Milhões
            </h3>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
              Telespectadores de TV Aberta (SBT + Band)
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              325 municípios cobertos por 34 torres HD no interior de São Paulo e Triângulo/Alto Paranaíba em Minas Gerais.
            </p>
          </div>

          <div className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-400/50 transition-all">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Monitor className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Rede de Totens OOH
            </h3>
            <p className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 mt-1">
              Presença Física em 29 Praças Estratégicas
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Displays verticais de alta resolução em pontos de alto fluxo em capitais e polos nobres como Alphaville, Copacabana e Búzios.
            </p>
          </div>

          <div className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-400/50 transition-all">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              78% Classes A e B
            </h3>
            <p className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 mt-1">
              Público com Alto Poder Aquisitivo
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Empresários, investidores, líderes do agronegócio e tomadores de decisão com interesse ativo em consumo e grandes negócios.
            </p>
          </div>

          <div className="p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-400/50 transition-all">
            <div className="w-12 h-12 bg-cyan-500/10 text-cyan-600 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              100% Auditável
            </h3>
            <p className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mt-1">
              Métricas Transparentes em Tempo Real
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Acompanhamento de impressões reais, dados de domicílios com TV (DTV) e relatórios de desempenho corporativo.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO NOBRE 1: REDE NACIONAL DE TOTENS DIGITAIS OOH (OUT OF HOME) */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Monitor className="w-3.5 h-3.5" /> Mídia OOH · Out Of Home
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Rede Nacional de Totens Digitais e Painéis Interativos
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Sua marca em displays verticais de alta definição, instalados em pontos nobres de circulação, shoppings, centros empresariais, pólos gastronômicos e praças de alto poder de compra.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0 text-center">
            <span className="text-3xl font-black text-amber-400 block">+29 Praças</span>
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Cidades Conectadas</span>
          </div>
        </div>

        {/* Grade de Cidades com Totens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {CIDADES_TOTENS.map((grupo) => (
            <div
              key={grupo.regiao}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>{grupo.regiao}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {grupo.cidades.map((cidade) => (
                  <span
                    key={cidade}
                    className="inline-flex items-center gap-1 text-xs bg-black/40 border border-white/10 text-slate-200 px-2.5 py-1 rounded-lg font-medium"
                  >
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {cidade}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-xs text-slate-400 relative z-10">
          * Atualização de mídia digital remota em tempo real com veiculação contínua e relatórios de exibição.
        </div>
      </section>

      {/* SEÇÃO NOBRE 2: COBERTURA DE TELEVISÃO ABERTA REGIONAL (SBT SP + BAND TRIÂNGULO MG) */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Tv className="w-3.5 h-3.5" /> Televisão Aberta Afiliada
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Cobertura de TV: Mais de 6,6 Milhões de Telespectadores
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Presença de peso nas maiores forças econômicas e polos do agronegócio do Brasil. Cobertura completa em 325 cidades estratégicas através das maiores redes de televisão aberta do país.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card SBT Interior São Paulo */}
          <div className="p-8 bg-gradient-to-br from-blue-900/10 via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 border-2 border-blue-600/30 rounded-3xl shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest bg-blue-600 text-white px-3 py-1 rounded-full">
                  SBT Interior SP
                </span>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Signal className="w-3.5 h-3.5" /> 34 Torres HD
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  O Maior SBT de São Paulo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cobertura maciça de <strong>1/3 de todo o Estado de São Paulo</strong> com sinal digital aberto de altíssima fidelidade.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center py-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 block">
                    202
                  </span>
                  <span className="text-[10.5px] uppercase font-bold text-slate-500">Cidades</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
                    3,32M
                  </span>
                  <span className="text-[10.5px] uppercase font-bold text-slate-500">Telespectadores</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
                    1,13M
                  </span>
                  <span className="text-[10.5px] uppercase font-bold text-slate-500">Domicílios DTV</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Principais Polos Econômicos Atendidos:
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  São José do Rio Preto, Araçatuba, Presidente Prudente, Catanduva, Votuporanga, Birigui, Fernandópolis, Penápolis, Dracena, Olímpia, Mirassol, Presidente Epitácio, Adamantina e mais 189 municípios.
                </p>
                <div className="flex items-center gap-2 pt-1 font-semibold text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> IPC Médio: 1,8372% (Elevadíssimo potencial de consumo)
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
              * Inserções de comerciais em vídeo de 15s/30s, patrocínio de programas locais e boletins.
            </div>
          </div>

          {/* Card Band Triângulo & Alto Paranaíba */}
          <div className="p-8 bg-gradient-to-br from-emerald-900/10 via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border-2 border-emerald-600/30 rounded-3xl shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest bg-emerald-600 text-white px-3 py-1 rounded-full">
                  Band Triângulo MG
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Signal className="w-3.5 h-3.5" /> Sinal HD Regional
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  Band Triângulo e Alto Paranaíba
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  A força da Band no coração do <strong>Triângulo Mineiro e Alto Paranaíba</strong>, região líder em PIB per capita e agronegócio.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center py-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                    123
                  </span>
                  <span className="text-[10.5px] uppercase font-bold text-slate-500">Cidades</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
                    3,31M
                  </span>
                  <span className="text-[10.5px] uppercase font-bold text-slate-500">População</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
                    1,12M
                  </span>
                  <span className="text-[10.5px] uppercase font-bold text-slate-500">Domicílios DTV</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Principais Polos Econômicos Atendidos:
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Uberlândia, Uberaba, Patos de Minas, Araguari, Passos, Ituiutaba, Araxá, Paracatu, Patrocínio, Unaí, São Sebastião do Paraíso, Frutal, João Pinheiro, Lagoa da Prata e mais 109 cidades.
                </p>
                <div className="flex items-center gap-2 pt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Força máxima no agronegócio, serviços e indústria de MG
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
              * Veiculação de comerciais em rede regional e programas de jornalismo investigativo e debates.
            </div>
          </div>
        </div>

        {/* Resumo Consolidado de TV */}
        <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold">Total Consolidado de TV Aberta</h4>
              <p className="text-xs text-slate-400">SBT Interior SP + Band Triângulo MG unificados no seu plano de mídia</p>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 text-center sm:text-right">
            <div>
              <span className="text-2xl font-black text-amber-400 block">325</span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Municípios</span>
            </div>
            <div>
              <span className="text-2xl font-black text-white block">+6,63 Milhões</span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Telespectadores</span>
            </div>
            <div>
              <span className="text-2xl font-black text-white block">+2,26 Milhões</span>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Domicílios DTV</span>
            </div>
          </div>
        </div>
      </section>

      {/* O Ecossistema Unificado Empire */}
      <section className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            A Força da Mídia Integrada
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Ecossistema Completo em Um Único Contrato
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Esqueça anúncios isolados em sites comuns. Na Empire Cidades, a sua marca é potencializada por um ecossistema sinérgico que cerca o consumidor em todos os momentos do dia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Portal de Notícias</h4>
                <span className="text-[11px] text-slate-400">+30 Milhões de views mensais</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Banners de alto impacto, publieditoriais com otimização SEO e presença de marca em matérias de grande repercussão.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 text-red-600 rounded-xl">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">TV Aberta & Streaming</h4>
                <span className="text-[11px] text-slate-400">SBT, Band e Empire TV ao Vivo</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Comerciais em vídeo HD na TV aberta e na transmissão contínua em streaming de programas jornalísticos e podcasts.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Totens Digitais OOH</h4>
                <span className="text-[11px] text-slate-400">29 Praças e Capitais</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Displays verticais de grande formato posicionados em locais de fluxo nobre, shoppings e centros gastronômicos.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Empire Rádio Web</h4>
                <span className="text-[11px] text-slate-400">Audiência contínua mobile e desktop</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Spots em áudio de 15s e 30s, patrocínio do boletim de notícias e do trânsito para motoristas e profissionais no trabalho.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-500/10 text-pink-600 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Revistas Digitais Empire</h4>
                <span className="text-[11px] text-slate-400">Edições mensais de prestígio</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Anúncios de página inteira e página dupla, com visual sofisticado e distribuição direta para leitores VIP.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Colunistas & Influenciadores</h4>
                <span className="text-[11px] text-slate-400">Liderança de opinião local</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Sua empresa associada a especialistas respeitados em negócios, saúde, política, direito, bem-estar e cultura.
            </p>
          </div>
        </div>
      </section>

      {/* Formatos Publicitários Disponíveis */}
      <section className="space-y-6">
        <div className="text-center space-y-1 mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Formatos de Alto Impacto
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Posicionamentos Estratégicos no Portal
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Super Banner Topo (Leaderboard)</h4>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-semibold text-amber-600">
                970 x 90 px
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              A primeira coisa que o leitor vê ao carregar qualquer página, matéria ou coluna do portal. Garantia de 100% de visibilidade imediata.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Máxima taxa de cliques e reconhecimento de marca
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Retângulo Lateral de Destaque</h4>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-semibold text-amber-600">
                300 x 250 px
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Exibido na barra lateral ao lado das notícias mais lidas e matérias principais com longo tempo de permanência na tela.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Formato ideal para campanhas de conversão e ofertas
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">In-Article (Meio do Artigo)</h4>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-semibold text-amber-600">
                728 x 90 px
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inserido estrategicamente no fluxo natural de leitura, capturando a atenção focada do usuário enquanto ele absorve a notícia.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Altíssimo engajamento em matérias de grande tráfego
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Mega Banner Entre Blocos (Billboard)</h4>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-semibold text-amber-600">
                970 x 250 px
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Formato gigante e cinematográfico distribuído entre as seções editoriais da home page, gerando impacto visual memorável.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Perfeito para lançamentos imobiliários, marcas automotivas e varejo
            </div>
          </div>
        </div>
      </section>

      {/* Seção Comercial de Fechamento Direto no WhatsApp */}
      <section id="contato-comercial" className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center space-y-8">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Departamento Comercial Online · Atendimento Imediato</span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Fale Diretamente Conosco no WhatsApp
          </h3>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
            Sem burocracia, sem formulários e sem espera por e-mail. Solicite nossa <strong>tabela de valores, Mídia Kit completo em PDF e condições personalizadas</strong> para o seu plano de mídia.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-9 py-5 rounded-2xl text-base sm:text-lg uppercase tracking-wider shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
          >
            <MessageCircle className="w-6 h-6 fill-current" />
            <span>Chamar no WhatsApp ({WHATSAPP_FORMATADO})</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto pt-4 text-xs text-slate-300 border-t border-white/10">
          <div className="flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Resposta em minutos</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tabela em PDF e formatos</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Planos customizados</span>
          </div>
        </div>
      </section>
    </div>
  );
}
