"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Calendar, Send, CheckCircle2, MessageSquare, Building2, User, Phone, Mail, MapPin } from "lucide-react";
import type { Talento } from "@/lib/talentos/types";

interface SolicitarOrcamentoModalProps {
  talento: Talento | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SolicitarOrcamentoModal({ talento, isOpen, onClose }: SolicitarOrcamentoModalProps) {
  const [nomeCliente, setNomeCliente] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [servicoDesejado, setServicoDesejado] = useState("");
  const [modalidade, setModalidade] = useState("Presencial");
  const [cidadeEvento, setCidadeEvento] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");
  const [descricaoBriefing, setDescricaoBriefing] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen || !talento) return null;

  const servicoAtual = servicoDesejado || talento.servicos?.[0] || "Comerciais de TV";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/talentos/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          talento_id: talento.id,
          nome_cliente: nomeCliente,
          empresa,
          whatsapp,
          email,
          servico_desejado: servicoAtual,
          modalidade,
          cidade_evento: cidadeEvento,
          data_prevista: dataPrevista,
          descricao_briefing: descricaoBriefing,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao registrar solicitação.");
      }

      setSucesso(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar solicitação.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const texto = `*SOLICITAÇÃO DE ORÇAMENTO - EMPIRE TALENTOS*\n\n` +
      `*Talento Selecionado:* ${talento.nome}\n` +
      `*Serviço Desejado:* ${servicoAtual}\n` +
      `*Modalidade:* ${modalidade}\n` +
      `*Empresa / Marca:* ${empresa || "Não informada"}\n` +
      `*Contato:* ${nomeCliente ? `${nomeCliente} (${whatsapp})` : (whatsapp || "A informar")}\n` +
      (email ? `*E-mail:* ${email}\n` : "") +
      `*Cidade / Local:* ${cidadeEvento || "A definir"}\n` +
      `*Data Prevista:* ${dataPrevista || "A combinar"}\n` +
      (descricaoBriefing ? `*Briefing / Detalhes:* ${descricaoBriefing}\n` : "");

    const rawPhone = talento.whatsapp || talento.redes_sociais?.whatsapp;
    let telefone = "5534999999999";
    if (rawPhone) {
      const clean = rawPhone.replace(/\D/g, "");
      if (clean.length === 10 || clean.length === 11) {
        telefone = `55${clean}`;
      } else if (clean.length > 11) {
        telefone = clean;
      }
    }

    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden my-8">
        {/* Cabeçalho do Modal */}
        <div className="bg-slate-50 dark:bg-slate-800 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-400 shrink-0 bg-slate-200 dark:bg-slate-700">
              <Image
                src={talento.foto_url}
                alt={talento.nome}
                fill
                unoptimized
                className="object-cover object-top"
              />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Solicitação de Orçamento
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{talento.nome}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{talento.titulo_profissional}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {sucesso ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Solicitação Enviada com Sucesso!</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Nossa equipe comercial do Grupo Empire já recebeu os detalhes do seu projeto com{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">{talento.nome}</span> e entrará em contato
                nas próximas horas.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-transform hover:scale-105"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {talento.whatsapp || talento.redes_sociais?.whatsapp
                      ? `Enviar Proposta no WhatsApp de ${talento.nome.split(" ")[0]}`
                      : "Falar no WhatsApp com o Atendimento"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 text-xs font-semibold">
                  {erro}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome do Contato */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Empresa */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    Empresa / Agência (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Grupo Alfa / Agência X"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    WhatsApp com DDD *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(34) 99999-9999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    E-mail de Contato
                  </label>
                  <input
                    type="email"
                    placeholder="contato@suaempresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Serviço Desejado */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Serviço Desejado *
                  </label>
                  <select
                    value={servicoAtual}
                    onChange={(e) => setServicoDesejado(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {talento.servicos && talento.servicos.length > 0 ? (
                      talento.servicos.map((s, idx) => (
                        <option key={idx} value={s}>
                          {s}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Comerciais de TV">Comerciais de TV</option>
                        <option value="Campanhas Publicitárias">Campanhas Publicitárias</option>
                        <option value="Palestras">Palestras</option>
                        <option value="Presença VIP">Presença VIP</option>
                        <option value="Cerimoniais e Apresentações">Cerimoniais e Apresentações</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Modalidade */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Modalidade
                  </label>
                  <select
                    value={modalidade}
                    onChange={(e) => setModalidade(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Online / Remoto">Online / Remoto</option>
                    <option value="Híbrido">Híbrido (Gravação + Presença)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cidade do Evento */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    Cidade do Evento / Campanha
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Uberlândia - MG"
                    value={cidadeEvento}
                    onChange={(e) => setCidadeEvento(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Data Prevista */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    Data ou Período Previsto
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 15 de Dezembro ou A combinar"
                    value={dataPrevista}
                    onChange={(e) => setDataPrevista(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Descrição / Briefing */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Briefing da Campanha ou Detalhes da Ação
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva o objetivo da campanha, público-alvo, formato esperado e outras informações relevantes..."
                  value={descricaoBriefing}
                  onChange={(e) => setDescricaoBriefing(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-md hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Registrando Solicitação..." : "Enviar Solicitação de Orçamento"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  title="Falar diretamente no WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Direto</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
