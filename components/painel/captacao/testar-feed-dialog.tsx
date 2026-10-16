"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ExternalLink, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface PreviewItem {
  id: string;
  titulo: string;
  resumo: string;
  imagem_url: string | null;
  imagem_credito: string;
  link_original: string;
  pubDate: string;
  categoria_nome: string;
  cidade_nome: string;
  tags_sugeridas: string[];
}

interface TestarFeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  initialVeiculo?: string;
  categoriaPadraoId?: string;
  cidadePadraoId?: string;
}

export function TestarFeedDialog({
  open,
  onOpenChange,
  initialUrl = "",
  initialVeiculo = "",
  categoriaPadraoId,
  cidadePadraoId,
}: TestarFeedDialogProps) {
  const [urlFeed, setUrlFeed] = useState(initialUrl);
  const [veiculo, setVeiculo] = useState(initialVeiculo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedTitle, setFeedTitle] = useState<string | null>(null);
  const [totalItens, setTotalItens] = useState<number | null>(null);
  const [itensPreview, setItensPreview] = useState<PreviewItem[]>([]);

  // Update fields when initialUrl changes
  if (initialUrl && initialUrl !== urlFeed && !loading && itensPreview.length === 0) {
    setUrlFeed(initialUrl);
    setVeiculo(initialVeiculo || "");
  }

  const handleTestar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlFeed.trim()) {
      setError("Insira uma URL válida para testar.");
      return;
    }

    setLoading(true);
    setError(null);
    setItensPreview([]);

    try {
      const res = await fetch("/api/admin/captacao/testar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url_feed: urlFeed.trim(),
          veiculo: veiculo.trim() || "Veículo",
          categoria_padrao_id: categoriaPadraoId,
          cidade_padrao_id: cidadePadraoId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar o feed.");
      }

      setFeedTitle(data.titulo_feed);
      setTotalItens(data.total_itens_no_feed);
      setItensPreview(data.itens_preview || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao testar feed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Testar Feed RSS / Atom
          </DialogTitle>
          <DialogDescription>
            Faz o download e extração dos 5 primeiros itens do feed em tempo real para validação (nenhum dado é salvo no banco).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTestar} className="space-y-4 my-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="url_feed_test">URL do Feed RSS / Atom</Label>
              <Input
                id="url_feed_test"
                placeholder="https://g1.globo.com/rss/g1/politica/"
                value={urlFeed}
                onChange={(e) => setUrlFeed(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="veiculo_test">Nome do Veículo</Label>
              <Input
                id="veiculo_test"
                placeholder="G1, UOL, Folha..."
                value={veiculo}
                onChange={(e) => setVeiculo(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Fechar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testando Feed...
                </>
              ) : (
                "Carregar e Validar Feed"
              )}
            </Button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Falha ao validar feed RSS</p>
              <p className="text-xs mt-1 text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {feedTitle && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Feed válido: <strong>{feedTitle}</strong></span>
            </div>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-full font-semibold">
              {totalItens} itens no feed
            </span>
          </div>
        )}

        {itensPreview.length > 0 && (
          <div className="space-y-4 mt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pré-visualização dos 5 Primeiros Itens
            </h4>
            <div className="space-y-3">
              {itensPreview.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row gap-4 items-start"
                >
                  {item.imagem_url ? (
                    <div className="relative w-full md:w-32 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <Image
                        src={item.imagem_url}
                        alt={item.titulo}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full md:w-32 h-24 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[10px]">Sem imagem</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                        {item.categoria_nome}
                      </span>
                      {item.cidade_nome !== "Sem cidade" && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold">
                          {item.cidade_nome}
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px]">
                        {new Date(item.pubDate).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <h5 className="font-semibold text-sm text-slate-900 dark:text-white leading-snug">
                      {item.titulo}
                    </h5>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {item.resumo || "Sem resumo disponível no feed."}
                    </p>

                    <div className="pt-1 flex items-center justify-between">
                      <a
                        href={item.link_original}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        Ver link original no feed <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-[10px] text-slate-400">
                        {item.imagem_credito}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
