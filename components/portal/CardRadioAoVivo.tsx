"use client";

export function CardRadioAoVivo() {
  return (
    <section className="my-8 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-[#151515]">
      <iframe
        src="https://player.xcast.com.br/player-topo-moderno1/12924/561010"
        frameBorder="0"
        width="100%"
        height="80"
        style={{ border: 0, display: "block" }}
        allow="autoplay"
        title="Rádio Empire Ao Vivo"
      />
    </section>
  );
}
