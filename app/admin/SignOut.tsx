import { redirect } from "next/navigation";
import { createClient } from "@/lib/auth";

export function SignOut() {
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <form action={signOut}>
      <button type="submit" className="admin-ghost">Sign out</button>
    </form>
  );
}
