import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://huvnuudknqbyjblksqwu.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dm51dWRrbnFieWpibGtzcXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNzU5MTgsImV4cCI6MjEwOTY1MTkxOH0.0pgMlQixSAx9trx6cy3Hy9fFfgVX2tNn7a2cSzAQPQI";

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session claims via getClaims() before Server Components run
  const { data: claimsData } = await supabase.auth.getClaims();

  // Fast edge protection for /admin routes (full cryptographic + RBAC guard also runs in page/API)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const claims = claimsData?.claims as Record<string, any> | undefined;
    const appMeta = claims?.app_metadata as Record<string, any> | undefined;
    if (!claims?.sub || appMeta?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
