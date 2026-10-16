import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enviarEmailAvisoVencimento } from "@/lib/email/servico";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Não autorizado: token CRON_SECRET inválido ou ausente." },
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const hojeDate = new Date();
    const hoje = hojeDate.toISOString().slice(0, 10);

    // Data de 3 dias no futuro para aviso prévio de vencimento
    const em3DiasDate = new Date(hojeDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const em3Dias = em3DiasDate.toISOString().slice(0, 10);

    // 1. Expirar anúncios cujo fim_em já passou
    const { data: expirados, error: errExp } = await supabase
      .from("anuncios")
      .update({ status: "expirado" })
      .eq("status", "ativo")
      .lt("fim_em", hoje)
      .select("id, titulo");

    if (errExp) throw errExp;

    // 2. Ativar anúncios agendados que iniciam hoje
    const { data: ativados, error: errAtiv } = await supabase
      .from("anuncios")
      .update({ status: "ativo" })
      .eq("status", "agendado")
      .lte("inicio_em", hoje)
      .gte("fim_em", hoje)
      .select("id, titulo");

    if (errAtiv) throw errAtiv;

    // 3. Enviar aviso por e-mail para campanhas vencendo em 3 dias
    const { data: vencendoEm3Dias } = await supabase
      .from("anuncios")
      .select(`
        id, titulo, fim_em,
        anunciante:anunciantes(nome, email)
      `)
      .eq("status", "ativo")
      .eq("fim_em", em3Dias);

    let emailsAvisoEnviados = 0;
    if (vencendoEm3Dias && vencendoEm3Dias.length > 0) {
      for (const item of vencendoEm3Dias) {
        const anuncianteData = Array.isArray(item.anunciante)
          ? item.anunciante[0]
          : item.anunciante;

        if (anuncianteData?.email) {
          await enviarEmailAvisoVencimento({
            email: anuncianteData.email,
            nomeCliente: anuncianteData.nome,
            tituloAnuncio: item.titulo,
            fimEm: item.fim_em,
          }).catch(console.error);
          emailsAvisoEnviados++;
        }
      }
    }

    // 4. Revalidar cache público
    try {
      revalidatePath("/");
      revalidatePath("/colunas");
    } catch {
      // Ignore cache in dev
    }

    return NextResponse.json({
      success: true,
      data: {
        data_execucao: hoje,
        anuncios_expirados: expirados?.length || 0,
        anuncios_ativados: ativados?.length || 0,
        emails_aviso_3_dias: emailsAvisoEnviados,
      },
    });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro no cron de anúncios.";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
