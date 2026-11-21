"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Send, CheckCircle2, MessageSquare, Building2, User, Phone, Mail, MapPin } from "lucide-react";
import type { Totem } from "@/lib/totens/types";

interface SolicitarAnuncioModalProps {
  totem: Totem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SolicitarAnuncioModal({ totem, isOpen, onClose }: SolicitarAnuncioModalProps) {
  const [nomeContato, setNomeContato] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen || !totem) return null;

  const rawPhone = totem.franqueado_whatsapp.replace(/\D/g, "");
  const whatsappFranqueado =
    rawPhone.length === 10 || rawPhone.length === 11 ? `55${rawPhone}` : rawPhone;

  const textoWhatsApp = `Olá! Encontrei o Totem Empire ${totem.nome} (${totem.estabelecimento_nome} - ${totem.cidade_nome}/${totem.estado}) no Portal Empire Cidades e gostaria de receber informações para anunciar minha empresa.\n\n` +
    `*Empresa / Marca:* ${empresa || "Não informada"}\n` +
    `*Contato:* ${nomeContato || "A informar"} (${whatsapp || "Não informado"})\n` +
    (cidade ? `*Cidade do Anunciante:* ${cidade}\n` : "") +
    (mensagem ? `*Mensagem / Dúvida:* ${mensagem}\n` : "");

  const urlWhatsApp = `https://wa.me/${whatsappFranqueado}?text=${encodeURIComponent(textoWhatsApp)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/totens/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totem_id: totem.id,
          nome_contato: nomeContato,
          empresa,
          whatsapp,
          email,
          cidade,
          mensagem,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registrar solicitação.");
      setSucesso(true);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-xl shadow-2xl text-slate-800 overflow-hidden my-8">
        {/* Cabeçalho */}
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-400 shrink-0 bg-slate-200">
              <Image
                src={totem.foto_url}
                alt={totem.nome}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 block">
                Solicitação de Publicidade
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {totem.nome}
              </h3>
              <p className="text-xs text-slate-500">
                {totem.estabelecimento_nome} — {totem.cidade_nome}/{totem.estado}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {sucesso ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black text-slate-900">Proposta Enviada com Sucesso!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                O franqueado responsável <span className="font-bold text-slate-900">{totem.franqueado_nome}</span> recebeu seu contato e apresentará a tabela de inserções e disponibilidade de slots.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a
                  href={urlWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Falar Direto no WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                  {erro}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={nomeContato}
                    onChange={(e) => setNomeContato(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    Empresa / Marca
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Supermercado Alvorada"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(34) 99999-9999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="carlos@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  Sua Cidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: Uberlândia - MG"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mensagem ou Objetivo da Campanha
                </label>
                <textarea
                  rows={3}
                  placeholder="Gostaria de saber preços de veiculação e slots disponíveis para o próximo mês..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Enviando..." : "Enviar Solicitação"}</span>
                </button>

                <a
                  href={urlWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Direto</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
