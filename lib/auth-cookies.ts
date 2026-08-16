/**
 * Cookie policy for the admin session.
 *
 * Kept in its own module with no imports so both the server client and the
 * proxy can share it — the proxy runs in the middleware runtime, where
 * `next/headers` is unavailable, so it cannot import from `lib/auth.ts`.
 *
 * Both places must pass the identical options: a cookie written with one set
 * of attributes and cleared with another is not reliably removed.
 */
export const AUTH_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  /**
   * `@supabase/ssr` defaults this to `false` so a browser client can read the
   * session. This app has no browser client — every Supabase call runs in a
   * server action or route handler — so the token can be kept out of reach of
   * JavaScript entirely, which removes session theft as an outcome of any XSS.
   */
  httpOnly: true,
  /**
   * The library default is 400 days, which means "I forgot to sign out" leaves
   * an editable session on that machine for over a year. Twelve hours keeps a
   * working day convenient while bounding an unattended browser.
   */
  maxAge: 60 * 60 * 12,
};
