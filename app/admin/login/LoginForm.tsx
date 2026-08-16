"use client";

import { useFormStatus } from "react-dom";

function Submit({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admin-primary" disabled={pending}>
      {pending ? busy : idle}
    </button>
  );
}

/** Email + password. The default way in. */
export function PasswordForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="admin-form">
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required autoComplete="username" />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />

      <Submit idle="Sign in" busy="Signing in…" />
    </form>
  );
}

/** Magic link. Kept as a fallback for when the password is forgotten. */
export function LoginForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="admin-form">
      <label htmlFor="link-email">Email</label>
      <input
        id="link-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Submit idle="Email me a link" busy="Sending…" />
    </form>
  );
}
