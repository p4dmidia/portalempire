import { getPortalData, getCategorias, getCidades, getMaterias } from "@/lib/portal/queries";
import { Header } from "@/components/portal/Header";
import { Footer } from "@/components/portal/Footer";
import { Ticker } from "@/components/portal/Ticker";
import { CookieBanner } from "@/components/portal/CookieBanner";

function hexToHsl(hex: string): string {

  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [portal, categorias, cidades, urgentes, ultimasFallback] = await Promise.all([
    getPortalData(),
    getCategorias(),
    getCidades(),
    getMaterias({ urgente: true, limit: 8 }),
    getMaterias({ limit: 8 }),
  ]);

  const tickerMaterias = urgentes.length > 0 ? urgentes : ultimasFallback;
  const primaryHsl = portal?.cor_primaria ? hexToHsl(portal.cor_primaria) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {primaryHsl && (
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { --primary: ${primaryHsl}; --ring: ${primaryHsl}; } .dark { --primary: ${primaryHsl}; --ring: ${primaryHsl}; }`,
          }}
        />
      )}
      <Ticker materias={tickerMaterias} />
      <Header portal={portal} categorias={categorias} cidades={cidades} />
      <div className="flex-1 max-w-[1300px] w-full mx-auto px-4 sm:px-6 py-5 md:py-6">
        {children}
      </div>
      <Footer portal={portal} categorias={categorias} />
      <CookieBanner />
    </div>
  );
}


