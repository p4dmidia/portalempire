import Link from "next/link";

interface LabelEditoriaProps {
  nome: string;
  slug: string;
  cor?: string | null;
  className?: string;
}

export function LabelEditoria({ nome, slug, cor, className = "" }: LabelEditoriaProps) {
  const badgeColor = cor || "#2563eb";

  return (
    <Link
      href={`/categoria/${slug}`}
      className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-opacity hover:opacity-90 ${className}`}
      style={{
        backgroundColor: `${badgeColor}15`,
        color: badgeColor,
        border: `1px solid ${badgeColor}30`,
      }}
    >
      {nome}
    </Link>
  );
}
