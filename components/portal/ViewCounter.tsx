"use client";

import { useEffect } from "react";

interface ViewCounterProps {
  materiaId: string;
}

export function ViewCounter({ materiaId }: ViewCounterProps) {
  useEffect(() => {
    if (!materiaId) return;

    const storageKey = `viewed_materia_${materiaId}`;
    if (sessionStorage.getItem(storageKey)) {
      return; // Já visualizado nesta sessão
    }

    // Registra visualização assincronamente sem bloquear o usuário
    fetch(`/api/views/${materiaId}`, { method: "POST" })
      .then(() => {
        sessionStorage.setItem(storageKey, "true");
      })
      .catch((err) => {
        console.error("Erro ao registrar contagem de visualização:", err);
      });
  }, [materiaId]);

  return null;
}
