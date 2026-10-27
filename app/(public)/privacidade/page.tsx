import type { Metadata } from "next";
import Link from "next/link";
import { getPortalData } from "@/lib/portal/queries";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade — Portal Empire (LGPD)",
  description:
    "Transparência sobre a coleta, uso, armazenamento e direitos dos titulares de dados pessoais sob a LGPD (Lei nº 13.709/2018).",
};

export default async function PrivacidadePage() {
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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Política de Privacidade
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)
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
            1. Introdução e Compromisso
          </h2>
          <p>
            O <strong>{nomePortal}</strong> tem o compromisso inegociável de respeitar a sua privacidade e proteger os dados pessoais de todos os nossos leitores, colunistas, anunciantes e parceiros. Esta Política de Privacidade descreve de forma clara e acessível como tratamos suas informações ao utilizar nosso portal de notícias, painéis administrativos e serviços digitais correlatos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            2. Quais Dados Pessoais Coletamos
          </h2>
          <p>Coletamos informações nas seguintes circunstâncias:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Navegação e Leitores:</strong> Endereço IP (anonimizado para auditoria de métricas e rate limit), tipo de navegador, páginas visualizadas, dados de cookies essenciais e identificadores técnicos de sessão.
            </li>
            <li>
              <strong>Colunistas e Editores:</strong> Nome completo, e-mail corporativo, dados cadastrais, biografia, fotografia de perfil, redes sociais, telefone e documento (CPF/CNPJ) e endereço quando aplicável para fins de repasse financeiro de anúncios via subconta Asaas.
            </li>
            <li>
              <strong>Anunciantes:</strong> Nome de contato comercial, razão social, e-mail, telefone/WhatsApp e CNPJ/CPF para emissão de faturas e cobranças publicitárias.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            3. Finalidade do Tratamento de Dados
          </h2>
          <p>Seus dados são tratados estritamente para as seguintes finalidades legítimas:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Entrega de conteúdo jornalístico regional em tempo real.</li>
            <li>Contabilização de audiência de matérias de forma agregada e anônima.</li>
            <li>Auditoria de impressões e cliques em campanhas publicitárias com proteção contra fraudes.</li>
            <li>Processamento seguro de transações financeiras e split de pagamentos através da instituição de pagamento homologada (Asaas).</li>
            <li>Registro de trilha de auditoria para segurança jurídica e administrativa de alterações editoriais.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            4. Compartilhamento de Dados com Terceiros
          </h2>
          <p>
            O <strong>{nomePortal}</strong> não comercializa nem transfere seus dados pessoais a terceiros não autorizados. O compartilhamento ocorre exclusivamente com parceiros tecnológicos essenciais:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Supabase:</strong> Infraestrutura de banco de dados e autenticação com criptografia de ponta a ponta e Row Level Security (RLS).</li>
            <li><strong>Asaas Gestão Financeira:</strong> Instituição de pagamento autorizada pelo Banco Central para liquidação de cobranças PIX/Cartão/Boleto e repasse de comissões.</li>
            <li><strong>Resend / Provedores de E-mail Transacional:</strong> Envio de avisos de cobrança, faturas e links de recuperação de senha.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            5. Seus Direitos como Titular de Dados (Art. 18 da LGPD)
          </h2>
          <p>Você possui o direito de solicitar a qualquer momento:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Confirmação da existência de tratamento e acesso aos dados.</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade.</li>
            <li>Revogação do consentimento concedido através do banner de preferências de cookies.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            6. Contato com o Encarregado de Dados (DPO)
          </h2>
          <p>
            Para exercer seus direitos de privacidade ou esclarecer dúvidas sobre esta política, entre em contato diretamente com nossa equipe de governança através do e-mail oficial: <a href="mailto:privacidade@empirecidades.com.br" className="text-primary font-bold hover:underline">privacidade@empirecidades.com.br</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
