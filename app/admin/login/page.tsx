import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminEmail, createClient, getAdmin, requestOrigin, supabaseConfigured } from "@/lib/auth";
import { LoginForm, PasswordForm, ResetForm } from "./LoginForm";

// Never index the admin area.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; reset?: string; error?: string }>;
}) {
  if (await getAdmin()) redirect("/admin");
  const { sent, reset, error } = await searchParams;

  if (!supabaseConfigured()) {
    return (
      <main className="admin-shell">
        <div className="admin-auth">
          <h1>Admin</h1>
          <p className="admin-note">
            Supabase Auth is not configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and <code>ADMIN_EMAIL</code>, then reload.
          </p>
        </div>
      </main>
    );
  }

  /**
   * Password sign-in.
   *
   * The primary route rather than the fallback: it needs no email round trip,
   * so it is unaffected by Supabase's built-in SMTP quota, and it avoids the
   * PKCE exchange, which breaks whenever the emailed link opens in a different
   * browser from the one that requested it.
   */
  async function signIn(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    if (email !== adminEmail()) redirect("/admin/login?error=denied");

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      console.error(
        `Password sign-in failed: status=${signInError.status} code=${signInError.code} message=${signInError.message}`,
      );
      redirect("/admin/login?error=credentials");
    }
    redirect("/admin");
  }

  async function sendLink(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "").trim().toLowerCase();
    // Checked here as well as after the redirect: no point mailing a link to
    // an address that could never sign in.
    if (email !== adminEmail()) redirect("/admin/login?error=denied");

    const supabase = await createClient();
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${await requestOrigin()}/admin/callback` },
    });

    if (!sendError) redirect("/admin/login?sent=1");

    // Supabase returns several very different failures here — rate limiting,
    // signups disabled, SMTP not configured — and they need different fixes.
    // Log the real one rather than collapsing them into "try again".
    console.error(
      `Magic link send failed: status=${sendError.status} code=${sendError.code} message=${sendError.message}`,
    );
    const reason = /rate|limit|seconds/i.test(sendError.message)
      ? "rate"
      : /signup|not allowed|disabled/i.test(sendError.message)
        ? "signups"
        : "send";
    redirect(`/admin/login?error=${reason}`);
  }

  /**
   * Password recovery.
   *
   * Points at /admin/recover rather than the magic-link callback: that route
   * lands on the page that actually sets a new password. Without it the
   * emailed link has nowhere to go and drops you on the site's home page,
   * which is what it did before this existed.
   */
  async function sendReset(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "").trim().toLowerCase();
    if (email !== adminEmail()) redirect("/admin/login?error=denied");

    const supabase = await createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${await requestOrigin()}/admin/recover`,
    });

    if (!resetError) redirect("/admin/login?reset=1");

    console.error(
      `Reset email failed: status=${resetError.status} code=${resetError.code} message=${resetError.message}`,
    );
    redirect(`/admin/login?error=${/rate|limit|seconds/i.test(resetError.message) ? "rate" : "send"}`);
  }

  return (
    <main className="admin-shell">
      <div className="admin-auth">
        <span className="eyebrow">Portfolio admin</span>
        <h1>Sign in</h1>

        {error === "denied" && <p className="admin-error">That address cannot sign in.</p>}
        {error === "credentials" && (
          <p className="admin-error">
            Wrong email or password. If you have never set one, create the user under
            Authentication → Users with <b>Auto Confirm</b> ticked.
          </p>
        )}
        {error === "rate" && (
          <p className="admin-error">
            Supabase&apos;s built-in email is rate limited — use the password above, or wait an hour.
          </p>
        )}
        {error === "signups" && (
          <p className="admin-error">
            Sign-ups are disabled, so the link cannot create a user. Add it under Authentication →
            Users instead.
          </p>
        )}
        {error === "callback" && (
          <p className="admin-error">
            That link is invalid, expired, or was opened in a different browser from the one that
            requested it. Use the password instead.
          </p>
        )}
        {sent && <p className="admin-ok">Check your inbox — the link expires shortly.</p>}
        {reset && (
          <p className="admin-ok">
            Reset link sent. Open it in this browser and you can choose a new password.
          </p>
        )}
        {error === "expired" && (
          <p className="admin-error">
            That reset link has expired or was already used. Send yourself another.
          </p>
        )}
        {error === "send" && (
          <p className="admin-error">Could not send the email. Try again shortly.</p>
        )}

        <PasswordForm action={signIn} />

        <details className="admin-alt">
          <summary>Forgot your password?</summary>
          <p className="admin-note">
            Sends a reset link. Open it in this browser — the exchange is tied to the one that
            asked for it.
          </p>
          <ResetForm action={sendReset} />
        </details>

        <details className="admin-alt">
          <summary>Email me a link instead</summary>
          <p className="admin-note">
            Supabase&apos;s built-in email allows only a few messages per hour, and the link must be
            opened in this same browser.
          </p>
          <LoginForm action={sendLink} />
        </details>
      </div>
    </main>
  );
}
