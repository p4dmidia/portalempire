"use client";

import { useState, useEffect } from "react";
import Image, { type ImageProps } from "next/image";
import {
  otimizarUrlImagem,
  obterImagemEditorialContextual,
  IMAGEM_FALLBACK_PADRAO,
} from "@/lib/portal/image-utils";

interface ImageWithFallbackProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  contexto?: string;
}

export function ImageWithFallback({
  src,
  alt,
  contexto,
  ...rest
}: ImageWithFallbackProps) {
  const textoContexto = contexto || (typeof alt === "string" ? alt : "");
  const [imgSrc, setImgSrc] = useState<string>(() =>
    otimizarUrlImagem(src, textoContexto)
  );
  const [tentativas, setTentativas] = useState(0);

  useEffect(() => {
    setImgSrc(otimizarUrlImagem(src, textoContexto));
    setTentativas(0);
  }, [src, textoContexto]);

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt || "Imagem da matéria"}
      referrerPolicy="no-referrer"
      onError={() => {
        if (tentativas === 0) {
          const contextual = obterImagemEditorialContextual(textoContexto);
          if (contextual && contextual !== imgSrc) {
            setTentativas(1);
            setImgSrc(contextual);
            return;
          }
        }
        if (tentativas <= 1 && imgSrc !== IMAGEM_FALLBACK_PADRAO) {
          setTentativas(2);
          setImgSrc(IMAGEM_FALLBACK_PADRAO);
        }
      }}
    />
  );
}

