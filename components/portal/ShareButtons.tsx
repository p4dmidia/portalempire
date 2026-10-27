"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Facebook, Twitter, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { decodificarEntidadesHtml, normalizarUrlCompartilhamento } from "@/lib/portal/texto-utils";

interface ShareButtonsProps {
  url: string;
  titulo: string;
}

export function ShareButtons({ url, titulo }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(() => normalizarUrlCompartilhamento(url));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loc = window.location;
      if (loc.hostname && !loc.hostname.includes("localhost") && !loc.hostname.includes("127.0.0.1")) {
        setShareUrl(loc.href);
      } else {
        setShareUrl(normalizarUrlCompartilhamento(url));
      }
    }
  }, [url]);

  const cleanTitle = decodificarEntidadesHtml(titulo);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(cleanTitle);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-4 border-y border-slate-100 dark:border-slate-800 my-6">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
        Compartilhar:
      </span>

      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
      >
        <Twitter className="w-3.5 h-3.5" />
        <span>X / Twitter</span>
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
      >
        <Facebook className="w-3.5 h-3.5" />
        <span>Facebook</span>
      </a>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="h-8 text-xs rounded-full gap-1.5"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5" />}
        <span>{copied ? "Link Copiado!" : "Copiar Link"}</span>
      </Button>
    </div>
  );
}
