import type { Metadata } from "next";
import Link from "next/link";
import { getPortalData } from "@/lib/portal/queries";
import { FileText, ArrowLeft, Scale, AlertTriangle, Megaphone, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Termos de Uso — Portal Empire",
  description:
    "Termos e Condições Gerais de Uso do Portal Empire para leitores, colunistas, anunciantes e parceiros.",
};

export default async function TermosPage() {
  const portal = await getPortalData();
  const nomePortal = portal?.nome || "Portal Empire";

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <Link
          href="/"
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o Portal
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Termos de Uso
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Condições gerais de navegação, conduta editorial, publicidade e serviços
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400">Última atualização: 09 de Outubro de 2026</p>
      </div>

      {/* Conteúdo */}
      <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao acessar e navegar no <strong>{nomePortal}</strong>, você concorda expressamente em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Caso não concorde com qualquer uma das disposições, solicitamos que não utilize nossos serviços.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            2. Diretrizes Editoriais e de Colunistas
          </h2>
          <p>
            O portal fomenta a liberdade de expressão responsável e a diversidade de opiniões regionais. Nossos colunistas e autores comprometem-se a:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Produzir conteúdo autoral, verídico e ético, respeitando os direitos autorais e de imagem de terceiros.</li>
            <li>Não publicar notícias falsas (*fake news*), discursos de ódio, conteúdos discriminatórios ou difamatórios.</li>
            <li>Submeter colunas à moderação e aprovação da administração quando exigido pelas diretrizes da plataforma.</li>
            <li>Reconhecer que opiniões emitidas em artigos assinados por colunistas não representam necessariamente o posicionamento institucional do portal.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            3. Captação de Notícias e Direitos Autorais
          </h2>
          <p>
            O <strong>{nomePortal}</strong> utiliza tecnologia de agregação e captação RSS para notícias de interesse público regional e nacional. Todo conteúdo captado de veículos parceiros exibe expressamente:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Selo de identificação e crédito ao veículo originador (*Via Veículo*).</li>
            <li>Resumo informativo conforme disponibilizado nos feeds públicos.</li>
            <li>Link direto para leitura na íntegra no veículo de origem com atributos de segurança (`rel=&quot;noopener nofollow&quot;`).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            4. Política de Publicidade e Anúncios
          </h2>
          <p>
            O marketplace publicitário do portal permite a contratação de espaços de mídia por anunciantes diretos ou em parceria com colunistas locais:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Os anúncios devem estar em conformidade com o Código de Autorregulamentação Publicitária (CONAR) e o Código de Defesa do Consumidor.</li>
            <li>São vedados anúncios com promessas fraudulentas, produtos proibidos por lei ou conteúdos de teor adulto/ilícito.</li>
            <li>O pagamento e ativação das campanhas ocorrem mediante liquidação em gateway autorizado (Asaas), com regras de comissão e split aplicadas automaticamente.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            5. Foro e Legislação Aplicável
          </h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Para a resolução de eventuais litígios decorrentes deste instrumento, fica eleito o Foro da Comarca da sede do portal.
          </p>
        </section>
      </div>
    </div>
  );
}
