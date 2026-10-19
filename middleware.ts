import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes("-auth-token") || c.name.startsWith("sb-")
  );

  let user = null;
  if (hasAuthCookie) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    } catch {
      user = null;
    }
  }

  const pathname = request.nextUrl.pathname;

  // 1. Proteção de rotas do /painel
  if (pathname.startsWith("/painel")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (profile.status === "pendente") {
      return NextResponse.redirect(new URL("/aguardando-aprovacao", request.url));
    }

    if (profile.status === "bloqueado") {
      return NextResponse.redirect(new URL("/bloqueado", request.url));
    }

    // Validação de permissão por prefixo de rota no painel
    if (pathname.startsWith("/painel/admin") && profile.role !== "admin") {
      return new NextResponse("Acesso não autorizado (403)", { status: 403 });
    }

    if (pathname.startsWith("/painel/editor")) {
      if (pathname.startsWith("/painel/editor/materias")) {
        if (!["admin", "editor", "colunista"].includes(profile.role)) {
          return new NextResponse("Acesso não autorizado (403)", { status: 403 });
        }
      } else if (!["admin", "editor"].includes(profile.role)) {
        return new NextResponse("Acesso não autorizado (403)", { status: 403 });
      }
    }

    if (
      pathname.startsWith("/painel/colunista") &&
      !["admin", "colunista"].includes(profile.role)
    ) {
      return new NextResponse("Acesso não autorizado (403)", { status: 403 });
    }

    if (
      pathname.startsWith("/painel/anunciante") &&
      !["admin", "anunciante"].includes(profile.role)
    ) {
      return new NextResponse("Acesso não autorizado (403)", { status: 403 });
    }
  }

  // 2. Redirecionamento se já autenticado tentando acessar login/cadastro/admin
  if (user && (pathname === "/login" || pathname === "/cadastro" || pathname === "/admin/login")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (profile?.status === "ativo") {
      if (profile.role === "admin") {
        return NextResponse.redirect(new URL("/painel/admin/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/painel", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/painel/:path*",
    "/admin/:path*",
    "/login",
    "/cadastro",
    "/recuperar-senha",
    "/redefinir-senha",
    "/aguardando-aprovacao",
    "/bloqueado",
  ],
};
