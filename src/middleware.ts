import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role as string | undefined;

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // /admin/equipe is admin-only (not accessible by equipe role)
    if (pathname.startsWith("/admin/equipe")) {
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } else {
      // All other admin pages: admin or equipe
      if (role !== "admin" && role !== "equipe") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  // Protect client portal routes (except login/cadastro)
  if (
    pathname.startsWith("/portalcliente") &&
    !pathname.startsWith("/portalcliente/login") &&
    !pathname.startsWith("/portalcliente/cadastro")
  ) {
    if (!user) {
      return NextResponse.redirect(
        new URL("/portalcliente/login", request.url)
      );
    }
  }

  // Protect partner routes (except login)
  if (pathname.startsWith("/parceiros") && !pathname.startsWith("/parceiros/login")) {
    if (!user) {
      return NextResponse.redirect(new URL("/parceiros/login", request.url));
    }
    if (role !== "fotografo" && role !== "influenciador" && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/portalcliente/:path*", "/parceiros/:path*"],
};
