import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, getAdmin } from "@/lib/auth";
import { PasswordFields } from "./PasswordFields";

export const metadata: Metadata = { robots: { index: false, follow: false } };
// The session this page depends on is created moments earlier by the recovery
// link, so a cached render would be worthless.
export const dynamic = "force-dynamic";

/** Long enough to be worth having; Supabase's own floor is only six. */
const MIN_LENGTH = 8;

export default async function PasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  /**
   * The recovery link signs you in before you get here, so an active session
   * is the proof that you opened a link sent to the admin address. There is no
   * separate token to validate — and because this is the same `getAdmin()`
   * every other admin page uses, a recovery session for any other address
   * lands on the login screen instead.
   */
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login?error=expired");

  const { error } = await searchParams;

  async function setPassword(formData: FormData) {
    "use server";

    // Re-checked inside the action: a server action is a POST endpoint that
    // anyone can call, and the page having rendered proves nothing about who
    // is submitting it.
    if (!(await getAdmin())) redirect("/admin/login?error=expired");

    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirm") || "");

    if (password.length < MIN_LENGTH) redirect("/admin/password?error=short");
    if (password !== confirm) redirect("/admin/password?error=match");

    const supabase = await createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      console.error(
        `Password update failed: status=${updateError.status} code=${updateError.code} message=${updateError.message}`,
      );
      // Supabase rejects a password identical to the current one, which is a
      // different problem from a server error and worth saying plainly.
      const reason = /same|different from the old/i.test(updateError.message) ? "same" : "failed";
      redirect(`/admin/password?error=${reason}`);
    }

    redirect("/admin?password=changed");
  }

  return (
    <main className="admin-shell">
      <div className="admin-auth">
        <span className="eyebrow">Portfolio admin</span>
        <h1>Set a new password</h1>
        <p className="admin-note">
          Signed in as {admin.email} from the recovery link. Choose a new password — at least{" "}
          {MIN_LENGTH} characters.
        </p>

        {error === "short" && (
          <p className="admin-error">Use at least {MIN_LENGTH} characters.</p>
        )}
        {error === "match" && <p className="admin-error">The two passwords do not match.</p>}
        {error === "same" && (
          <p className="admin-error">That is already your password. Choose a different one.</p>
        )}
        {error === "failed" && (
          <p className="admin-error">Could not save the password. Try again.</p>
        )}

        <form action={setPassword} className="admin-form">
          <PasswordFields />
        </form>
      </div>
    </main>
  );
}
