import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AUTH_COOKIE_OPTIONS } from "@/lib/auth-cookies";

/**
 * Keeps the Supabase session cookie fresh and gates /admin.
 *
 * This is a convenience redirect, not the security boundary — the real check
 * runs inside every server action via `requireAdmin()`. Middleware alone would
 * be insufficient, since server actions are reachable by POST regardless of
 * what the middleware does with page navigations.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Without Supabase configured there is no admin to authenticate; let the
  // page render its own "not configured" notice rather than redirect-looping.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    // Must match lib/auth.ts exactly; a cookie written with one set of
    // attributes is not reliably cleared with another.
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  const allowed = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const isAdmin = Boolean(email && allowed && email === allowed);

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !isAdmin) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/admin/login";
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  // Skip static assets and image optimisation; running auth on every image
  // request would add a Supabase round trip per asset.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|svg|webp|mp4|pdf)$).*)"],
};
