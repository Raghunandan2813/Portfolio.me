import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/auth";

/**
 * Landing point for the emailed password-recovery link.
 *
 * Deliberately separate from /admin/callback rather than that route plus a
 * `?next=` parameter. Supabase matches the redirect against an allow-list, and
 * whether a query string participates in that match is exactly the kind of
 * detail that fails silently at 11pm; a distinct path is an exact entry with
 * nothing to get wrong. It also keeps the magic-link route free of a
 * redirect target read from the URL, which is the shape open redirects take.
 *
 * The exchange only establishes a session. Authorisation is still decided by
 * `getAdmin()` on the page that follows, so a valid recovery link for some
 * other address cannot set a password on this dashboard.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/admin/login?error=callback", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error(
      `Recovery exchange failed: status=${error.status} code=${error.code} message=${error.message}`,
    );
    return NextResponse.redirect(new URL("/admin/login?error=callback", request.url));
  }

  return NextResponse.redirect(new URL("/admin/password", request.url));
}
