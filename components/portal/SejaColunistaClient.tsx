"use client";

import { useState } from "react";
import Link from "next/link";
import type { CidadeData } from "@/lib/portal/queries";
import {
  Tv,
  Radio,
  BookOpen,
  Globe,
  Smartphone,
  Share2,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  MapPin,
  Users,
  Megaphone,
  DollarSign,
  Award,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Calculator,
  ChevronDown,
  Star,
  Zap,
  Building2,
} from "lucide-react";

interface SejaColunistaClientProps {
  codigoRef: string;
  cidadeInicial: string;
  cidades: CidadeData[];
  whatsappUrl: string;
}

const ECOSSISTEMA_ITENS = [
  {
    icone: Tv,
    titulo: "TV Ao Vivo",
    descricao: "WebTV com programação e coberturas especiais em tempo real",
  },
  {
    icone: Radio,
    titulo: "Rádio Ao Vivo",
    descricao: "Streaming digital 24h conectando ouvintes de todas as regiões",
  },
  {
    icone: BookOpen,
    titulo: "Revista Digital",
    descricao: "Edições especiais da Empire Magazine com alto valor editorial",
  },
  {
    icone: Globe,
    titulo: "Portal de Notícias",
    descricao: "Indexação rápida no Google e audiência qualificada nacional",
  },
  {
    icone: Smartphone,
    titulo: "Mobile Experience",
    descricao: "Leitura ágil e responsiva na palma da mão em qualquer celular",
  },
  {
    icone: Share2,
    titulo: "Redes Sociais",
    descricao: "Distribuição multicanal para amplificar suas matérias e colunas",
  },
];

const MOTIVOS_LICENCIADO = [
  {
    icone: TrendingUp,
    titulo: "Marca forte e reconhecida",
    descricao:
      "Conte com a credibilidade editorial e institucional do Grupo Empire para abrir portas na sua cidade.",
  },
  {
    icone: MapPin,
    titulo: "Conteúdo multiplataforma",
    descricao:
      "Sua coluna integrada a um ecossistema com TV, Rádio, Revista Digital, Portal e Redes Sociais.",
  },
  {
    icone: Users,
    titulo: "Suporte e treinamento",
    descricao:
      "Você não estará sozinho. Temos uma equipe editorial e comercial pronta para te apoiar.",
  },
  {
    icone: Megaphone,
    titulo: "Expansão e novos negócios",
    descricao:
      "Mais visibilidade para sua cidade e oportunidades comerciais vendendo espaços publicitários no portal.",
  },
  {
    icone: Award,
    titulo: "Seja parte de um projeto nacional",
    descricao:
      "Juntos, levamos o nome e os acontecimentos da sua cidade para todo o Brasil e o mundo.",
  },
];

const PERGUNTAS_FREQUENTES = [
  {
    pergunta: "Pode haver mais de um colunista na mesma cidade ou região?",
    resposta:
      "Sim! Uma cidade ou região possui diversas áreas de interesse (Política, Economia, Negócios, Gastronomia, Eventos, Esportes, Saúde, Direito, Agro, etc.). Por isso, permitimos mais de um colunista por cidade ou região, cada um com sua própria coluna, identidade e linha editorial.",
  },
  {
    pergunta: "Como funciona a comissão recorrente de R$ 50,00 por indicado?",
    resposta:
      "Ao se tornar colunista, você recebe um link exclusivo de indicação dentro do seu painel. Para cada novo colunista que se cadastrar pelo seu link e mantiver a mensalidade ativa, você recebe R$ 50,00 todos os meses de forma recorrente! Com apenas 5 indicados ativos, sua própria mensalidade de R$ 250,00 já fica 100% paga.",
  },
  {
    pergunta: "Como funciona a venda de espaços publicitários dentro do portal?",
    resposta:
      "Como colunista oficial, você tem acesso ao módulo 'Meus Anunciantes e Espaços' dentro do painel. Você pode vender espaços de banners para empresas e profissionais da sua cidade pelo valor comercial que negociar, cadastrar os banners no sistema e entregar relatórios profissionais de impressões e cliques para seus clientes.",
  },
  {
    pergunta: "Qual é o valor do investimento mensal e como é feito o pagamento?",
    resposta:
      "O investimento para manter sua coluna oficial ativa, publicar matérias ilimitadas, comercializar espaços publicitários e participar do programa de indicação recorrente é de apenas R$ 250,00 por mês, pagos de forma simples e segura via PIX ou cartão através do Mercado Pago.",
  },
  {
    pergunta: "Preciso ter experiência prévia com programação ou tecnologia?",
    resposta:
      "Nenhuma! Nosso painel editorial foi desenhado para ser tão simples quanto postar em uma rede social. Você escreve sua matéria, adiciona a foto de capa, publica em segundos e já acompanha as visualizações.",
  },
];

export function SejaColunistaClient({
  codigoRef,
  cidadeInicial,
  cidades,
  whatsappUrl,
}: SejaColunistaClientProps) {
  const [indicadosSimulados, setIndicadosSimulados] = useState(6);
  const [anunciantesSimulados, setAnunciantesSimulados] = useState(4);
  const [valorPorAnuncio, setValorPorAnuncio] = useState(300);
  const [faqAberto, setFaqAberto] = useState<number | null>(0);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(cidadeInicial);

  const ganhoIndicacoes = indicadosSimulados * 50;
  const ganhoPublicidade = anunciantesSimulados * valorPorAnuncio;
  const faturamentoBrutoMensal = ganhoIndicacoes + ganhoPublicidade;
  const lucroLiquidoEstimado = faturamentoBrutoMensal - 250;

  const paramsCheckout = new URLSearchParams();
  if (codigoRef) paramsCheckout.set("ref", codigoRef);
  if (cidadeSelecionada) paramsCheckout.set("cidade", cidadeSelecionada);
  const queryCheckout = paramsCheckout.toString();
  const cadastroUrl = `/checkout/colunista${queryCheckout ? `?${queryCheckout}` : ""}`;

  return (
    <div className="space-y-14 pb-16">
      {/* =====================================================================
          1. HERO PRINCIPAL — FUNDO BRANCO CLEAN COM DETALHES DOURADOS
         ===================================================================== */}
      <section className="relative rounded-3xl overflow-hidden bg-white text-slate-900 border-2 border-amber-400/60 shadow-xl">
        {/* Efeitos suaves dourados ao fundo */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 py-12 sm:px-10 md:px-14 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Coluna Esquerda: Copy de Vendas */}
          <div className="lg:col-span-7 space-y-6">
            {codigoRef && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Convite Especial Ativo — Código de Indicação: <strong>{codigoRef}</strong>
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-extrabold uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Estamos Captando Colunistas & Licenciados</span>
            </div>

            <div className="space-y-3">
              <p className="text-amber-600 font-serif italic text-lg sm:text-xl font-semibold">
                “Agora sua cidade tem um espaço para ser vista!”
              </p>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.12] uppercase text-slate-900">
                Seja um Colunista Oficial do{" "}
                <span className="text-amber-600">Portal Empire Cidades</span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                Faça a cobertura oficial da sua cidade ou região, comercialize espaços
                publicitários dentro do portal e ganhe{" "}
                <strong className="text-amber-700 font-extrabold">
                  R$ 50,00 por mês de recorrência
                </strong>{" "}
                por cada novo colunista indicado.
              </p>
            </div>

            {/* Destaques Rápidos em Pílulas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-amber-600 text-xs font-black uppercase tracking-wider">
                  Cobertura Regional
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  Várias vozes por cidade
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Pode haver mais de 1 colunista por município ou região
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-amber-600 text-xs font-black uppercase tracking-wider">
                  Publicidade Local
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  Venda de Anúncios
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Fature vendendo banners para empresas da sua região
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300">
                <div className="text-amber-700 text-xs font-black uppercase tracking-wider">
                  Indicação Recorrente
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  R$ 50,00 / mês por indicado
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  Comissão mensal contínua enquanto o indicado estiver ativo
                </div>
              </div>
            </div>

            {/* CTAs do Hero */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href={cadastroUrl}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-sm sm:text-base font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Quero Ser Colunista Agora</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Falar com a Equipe no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Coluna Direita: Card de Proposta de Valor & Preço */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white border-2 border-amber-400 p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">
                Licença Oficial Colunista
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 block">
                  Informação que conecta todas as cidades
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  Plano Colunista & Licenciado
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Acesso integral à plataforma editorial, comercial e ao programa de afiliados.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-600 font-medium block">
                    Mensalidade fixa
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-bold text-amber-700">R$</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                      250,00
                    </span>
                    <span className="text-xs text-slate-500">/mês</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                    Sem fidelidade
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-1">
                    PIX ou Cartão
                  </span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Cobertura da sua cidade ou região</strong>{" "}
                    (permitido mais de um colunista por localidade)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Venda espaços publicitários</strong> no
                    portal e fique com o lucro dos seus anunciantes locais
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">
                      Ganhe R$ 50,00/mês de recorrência
                    </strong>{" "}
                    para cada novo colunista indicado por você
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">
                      Coluna exclusiva indexada no Google
                    </strong>{" "}
                    com sua foto, bio e redes sociais
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">
                      Presença no Ecossistema Empire:
                    </strong>{" "}
                    Portal, TV, Rádio e Revista Digital
                  </span>
                </li>
              </ul>

              <Link
                href={cadastroUrl}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-black uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-md"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Fazer Meu Cadastro de Colunista</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Barra Inferior do Hero — Ecossistema de 6 Ícones */}
        <div className="relative z-10 bg-slate-50 border-t border-slate-200 px-6 py-6 sm:px-10">
          <div className="text-center mb-5">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700">
              Um Ecossistema Completo de Comunicação
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ECOSSISTEMA_ITENS.map((item) => {
              const Icon = item.icone;
              return (
                <div
                  key={item.titulo}
                  className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-colors shadow-xs"
                >
                  <div className="w-11 h-11 rounded-full border border-amber-300 bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    {item.titulo}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {item.descricao}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. OS 3 PILARES DE ATUAÇÃO E MONETIZAÇÃO DO COLUNISTA
         ===================================================================== */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#c8102e]">
            Como Funciona na Prática
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Três Formas Poderosas de Crescer com o Portal Empire Cidades
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Mais do que escrever artigos: você assume uma operação jornalística e comercial na
            sua região com ganhos escaláveis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pilar 1: Cobertura da Cidade */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-700">
                1. Autoridade & Voz Local
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Cobertura da Sua Cidade ou Região
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Publique notícias, bastidores políticos, cobertura de eventos, entrevistas,
                empreendedorismo e destaques da sua cidade.
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <strong>Múltiplos colunistas por cidade:</strong> Não há trava de exclusividade
                por município. Sua cidade ou região pode contar com vários colunistas cobrindo
                diferentes editorias e segmentos!
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
              ✓ Publicações ilimitadas no portal
            </div>
          </div>

          {/* Pilar 2: Venda de Espaços Publicitários */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                <Megaphone className="w-6 h-6" />
              </div>
              <span className="inline-block text-[11px] font-black uppercase tracking-wider text-emerald-700">
                2. Monetização Direta com Empresas
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Venda Espaços Publicitários no Portal
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Empresas, clínicas, concessionárias, imobiliárias e comércios da sua cidade
                precisam de visibilidade qualificada. Como colunista, você pode vender banners
                e espaços publicitários dentro do portal!
              </p>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <strong>Painel Comercial Próprio:</strong> Cadastre seus anunciantes, suba os
                banners e apresente relatórios reais de impressões e cliques para fidelizar
                seus patrocinadores.
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-bold text-emerald-700">
              ✓ Alto potencial de retorno já no 1º anunciante
            </div>
          </div>

          {/* Pilar 3: Indicação Recorrente R$ 50/mês */}
          <div className="bg-white rounded-3xl p-7 border-2 border-amber-400 shadow-md flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-700">
                3. Renda Passiva e Recorrente
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Ganhe R$ 50,00/mês por Cada Novo Colunista Indicado
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Conhece jornalistas, comunicadores, influenciadores, advogados ou líderes em
                sua cidade ou em outras regiões? Indique novos colunistas pelo seu link
                exclusivo!
              </p>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950">
                <strong>Matemática Simples:</strong> Cada indicado ativo paga R$ 250,00/mês e
                gera <strong>R$ 50,00 por mês de comissão recorrente</strong> para você. Com{" "}
                <strong>5 indicados</strong>, você ganha R$ 250,00/mês e sua assinatura fica
                100% paga!
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-bold text-amber-700">
              ✓ Saque das comissões direto via PIX no painel
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. SIMULADOR INTERATIVO DE GANHOS DO COLUNISTA (FUNDO BRANCO)
         ===================================================================== */}
      <section className="rounded-3xl bg-white text-slate-900 p-6 sm:p-10 border-2 border-slate-200 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador de Ganhos Mensais</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Simule Quanto Você Pode Faturar Todos os Meses como Colunista
            </h2>
            <p className="text-sm text-slate-600">
              Ajuste os controles abaixo para calcular sua receita combinando a{" "}
              <strong className="text-amber-700">
                indicação de novos colunistas (R$ 50,00/mês cada)
              </strong>{" "}
              com a{" "}
              <strong className="text-emerald-700">
                venda de espaços publicitários na sua cidade
              </strong>
              :
            </p>

            <div className="space-y-5 pt-2">
              {/* Controle 1: Indicados */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800">
                    1. Novos Colunistas Indicados por Você:
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-black">
                    {indicadosSimulados} {indicadosSimulados === 1 ? "indicado" : "indicados"} (
                    + R$ {ganhoIndicacoes.toLocaleString("pt-BR")}/mês)
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={indicadosSimulados}
                  onChange={(e) => setIndicadosSimulados(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>0 indicados</span>
                  <span>5 indicados (paga sua mensalidade!)</span>
                  <span>30 indicados (R$ 1.500/mês)</span>
                </div>
              </div>

              {/* Controle 2: Anunciantes Locais */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800">
                    2. Empresas Anunciando na Sua Coluna / Cidade:
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500 text-white font-black">
                    {anunciantesSimulados}{" "}
                    {anunciantesSimulados === 1 ? "empresa" : "empresas"} (+ R${" "}
                    {ganhoPublicidade.toLocaleString("pt-BR")}/mês)
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  value={anunciantesSimulados}
                  onChange={(e) => setAnunciantesSimulados(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Valor médio cobrado por anunciante local:</span>
                  <div className="flex gap-1.5">
                    {[150, 300, 500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setValorPorAnuncio(val)}
                        className={`px-2.5 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                          valorPorAnuncio === val
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }`}
                      >
                        R$ {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado da Simulação */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-amber-50/70 border-2 border-amber-400 p-6 sm:p-8 space-y-5">
              <div className="text-xs font-black uppercase tracking-wider text-amber-700">
                Projeção Mensal Recorrente
              </div>

              <div className="space-y-2.5 text-sm border-b border-amber-200 pb-4">
                <div className="flex justify-between text-slate-700">
                  <span>Comissões de Indicação ({indicadosSimulados}x R$ 50):</span>
                  <strong className="text-amber-700">
                    + R$ {ganhoIndicacoes.toLocaleString("pt-BR")},00
                  </strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>
                    Venda de Publicidade ({anunciantesSimulados}x R$ {valorPorAnuncio}):
                  </span>
                  <strong className="text-emerald-700">
                    + R$ {ganhoPublicidade.toLocaleString("pt-BR")},00
                  </strong>
                </div>
                <div className="flex justify-between text-slate-500 text-xs pt-1">
                  <span>Mensalidade de Colunista Empire:</span>
                  <span>- R$ 250,00</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-600 font-medium block">
                  Saldo Líquido Estimado no Bolso:
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                  R$ {Math.max(0, lucroLiquidoEstimado).toLocaleString("pt-BR")},00{" "}
                  <span className="text-sm font-normal text-slate-500">/mês</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  *Simulação ilustrativa. Não há teto máximo de indicações ou de venda de
                  anúncios.
                </p>
              </div>

              <Link
                href={cadastroUrl}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-black uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-md"
              >
                <span>Começar Agora por R$ 250/mês</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. POR QUE SER UM LICENCIADO / CADA CIDADE UMA NOVA CONEXÃO
         ===================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Coluna Esquerda: Por que ser um licenciado? */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-sm space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
            Por Que Ser um Colunista Licenciado?
          </div>

          <div className="space-y-5">
            {MOTIVOS_LICENCIADO.map((item) => {
              const Icon = item.icone;
              return (
                <div key={item.titulo} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full border-2 border-amber-400 bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {item.titulo}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                      {item.descricao}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita: Cada Cidade, Uma Nova Conexão (Fundo Branco) */}
        <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-7 sm:p-9 border-2 border-amber-400 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-600 block">
                Expansão Nacional & Regional
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 uppercase">
                Cada Cidade, Uma Nova Conexão.
              </h3>
            </div>

            <ul className="space-y-3 text-sm text-slate-700">
              {[
                "Notícias locais e cobertura regional em tempo real",
                "Informação de qualidade com respaldo editorial",
                "Valorização do comércio, cultura e lideranças da sua cidade",
                "Mais audiência, engajamento e relevância política e empresarial",
                "Oportunidade real de renda recorrente e crescimento",
              ].map((Ponto) => (
                <li key={Ponto} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{Ponto}</span>
                </li>
              ))}
            </ul>

            {/* Seletor rápido de cidades */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <label className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>Consulte a disponibilidade para sua cidade ou região:</span>
              </label>
              <select
                value={cidadeSelecionada}
                onChange={(e) => setCidadeSelecionada(e.target.value)}
                className="w-full rounded-xl bg-white text-slate-900 border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="">Todas as Cidades e Regiões do Brasil (Vagas Abertas)</option>
                {cidades.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.nome} - {c.uf} (Aceitando Novos Colunistas)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-emerald-700 font-semibold">
                ✓ Status: Vagas abertas para novos colunistas (permitido mais de um colunista
                por cidade).
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 text-center space-y-3">
            <p className="text-amber-600 font-serif italic text-xl font-bold">
              “Juntos somos mais fortes! É a sua cidade no centro das notícias.”
            </p>
            <Link
              href={cadastroUrl}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 transition-all shadow-md"
            >
              <span>Garantir Minha Coluna Agora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. PERGUNTAS FREQUENTES (FAQ)
         ===================================================================== */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Perguntas Frequentes sobre o Programa de Colunistas
          </h2>
        </div>

        <div className="space-y-3">
          {PERGUNTAS_FREQUENTES.map((item, idx) => {
            const aberto = faqAberto === idx;
            return (
              <div
                key={item.pergunta}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setFaqAberto(aberto ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{item.pergunta}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-500 shrink-0 transition-transform duration-200 ${
                      aberto ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {aberto && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.resposta}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          6. CHAMADA FINAL DE FECHAMENTO (FUNDO BRANCO)
         ===================================================================== */}
      <section className="rounded-3xl bg-white text-slate-900 p-8 sm:p-12 border-2 border-amber-400 text-center space-y-6 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Informação • Credibilidade • Desenvolvimento • Juntos por Mais Cidades</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black max-w-2xl mx-auto leading-tight uppercase text-slate-900">
          Fale Conosco ou Cadastre-se Agora e Seja um Colunista do{" "}
          <span className="text-amber-600">Empire Cidades!</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Mensalidade acessível de <strong>R$ 250,00/mês</strong>, liberdade para cobrir sua
          cidade, vender espaços publicitários e ganhar <strong>R$ 50,00/mês recorrente</strong>{" "}
          por cada novo colunista indicado.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href={cadastroUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm sm:text-base font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
          >
            <span>Criar Conta de Colunista (R$ 250/mês)</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Atendimento via WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
}
