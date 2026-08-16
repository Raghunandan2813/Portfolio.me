import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { readEnv } from "./env";

/**
 * Admin authentication.
 *
 * Supabase Auth answers "who is this", but it does NOT decide who may write:
 * the app talks to Postgres through Drizzle using the database password, which
 * connects as the table owner and therefore bypasses Row Level Security
 * entirely. Authorisation lives in `requireAdmin()` below and must be called by
 * every mutating server action. Hiding a button in the UI is not a control.
 */

/** Only this address may sign in. Anyone else is rejected after the link. */
export function adminEmail() {
  return (readEnv("ADMIN_EMAIL") || "").trim().toLowerCase();
}

export function supabaseConfigured() {
  return Boolean(
    readEnv("NEXT_PUBLIC_SUPABASE_URL") &&
      readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") &&
      adminEmail(),
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    readEnv("NEXT_PUBLIC_SUPABASE_URL")!,
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Session refresh still happens in middleware, so this is safe.
          }
        },
      },
    },
  );
}

/** The signed-in admin, or null. Never throws, so layouts can branch on it. */
export async function getAdmin() {
  if (!supabaseConfigured()) return null;

  const supabase = await createClient();
  // getUser() revalidates against Supabase; getSession() trusts the cookie,
  // which a client could forge.
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const email = data.user.email?.toLowerCase();
  if (!email || email !== adminEmail()) return null;

  return { id: data.user.id, email };
}

/**
 * Guard for every mutating path. Throws rather than returning a flag so a
 * forgotten check fails loudly instead of silently writing.
 */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not authorised");
  return admin;
}
