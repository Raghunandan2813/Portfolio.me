import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/auth";

/**
 * Landing point for the emailed magic link.
 *
 * Supabase sends a `code` which is exchanged here for a session cookie. The
 * email allowlist is enforced by `getAdmin()` on every admin page, so a valid
 * link for the wrong address still cannot reach the dashboard.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/admin/login?error=callback", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/admin/login?error=callback", request.url));
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
