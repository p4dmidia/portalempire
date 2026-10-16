"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, MessageSquare, Send } from "lucide-react";

export function AnuncieForm({ portalNome = "Portal Empire" }: { portalNome?: string }) {
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      setErro("Por favor, preencha nome, e-mail e telefone/WhatsApp.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          empresa: empresa.trim(),
          email: email.trim(),
          telefone: telefone.trim(),
          mensagem: mensagem.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar solicitação.");
      }

      setEnviado(true);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const textoWhatsApp = encodeURIComponent(
    `Olá, gostaria de receber o Mídia Kit do ${portalNome}.\n\n*Nome:* ${nome || "Não informado"}\n*Empresa:* ${empresa || "Não informada"}\n*E-mail:* ${email || "Não informado"}\n*Interesse:* ${mensagem || "Anúncios e formatos no portal"}`
  );

  if (enviado) {
    return (
      <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
          Solicitação Enviada com Sucesso!
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Obrigado, <strong className="text-slate-900 dark:text-white">{nome}</strong>! Nossa equipe comercial recebeu seus dados e entrará em contato em breve no e-mail <strong>{email}</strong> com nossa tabela de formatos e métricas.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/5511999999999?text=${textoWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow transition-colors w-full sm:w-auto"
          >
            <MessageSquare className="w-4 h-4" />
            Falar no WhatsApp Comercial Agora
          </a>
          <Button
            variant="outline"
            onClick={() => {
              setEnviado(false);
              setNome("");
              setEmpresa("");
              setEmail("");
              setTelefone("");
              setMensagem("");
            }}
            className="w-full sm:w-auto"
          >
            Enviar Nova Mensagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-300 text-xs">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contato-nome">Seu Nome *</Label>
          <Input
            id="contato-nome"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="contato-empresa">Nome da Empresa</Label>
          <Input
            id="contato-empresa"
            placeholder="Sua Empresa"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contato-email">E-mail Corporativo *</Label>
          <Input
            id="contato-email"
            type="email"
            placeholder="contato@empresa.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="contato-tel">WhatsApp / Telefone *</Label>
          <Input
            id="contato-tel"
            placeholder="(11) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contato-msg">Como podemos ajudar sua marca?</Label>
        <Textarea
          id="contato-msg"
          rows={4}
          placeholder="Informe seu interesse (ex.: anúncio no topo da coluna de Campinas, banner na home, publieditorial, etc.)..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="mt-1"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando Solicitação...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Enviar Solicitação de Mídia Kit
          </>
        )}
      </Button>
    </form>
  );
}
