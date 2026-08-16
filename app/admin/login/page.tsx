import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminEmail, createClient, getAdmin, requestOrigin, supabaseConfigured } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

// Never index the admin area.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  if (await getAdmin()) redirect("/admin");
  const { sent, error } = await searchParams;

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

    redirect(sendError ? "/admin/login?error=send" : "/admin/login?sent=1");
  }

  return (
    <main className="admin-shell">
      <div className="admin-auth">
        <span className="eyebrow">Portfolio admin</span>
        <h1>Sign in</h1>
        {sent ? (
          <p className="admin-ok">
            Check your inbox. The link signs you in and expires shortly.
          </p>
        ) : (
          <>
            <p className="admin-note">
              A one-time link is emailed to the owner address. There is no password.
            </p>
            <LoginForm action={sendLink} />
          </>
        )}
        {error === "denied" && <p className="admin-error">That address cannot sign in.</p>}
        {error === "send" && <p className="admin-error">Could not send the link. Try again.</p>}
        {error === "callback" && <p className="admin-error">That link is invalid or has expired.</p>}
      </div>
    </main>
  );
}
