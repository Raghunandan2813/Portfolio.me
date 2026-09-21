"use client";

import { useFormStatus } from "react-dom";

/**
 * New-password fields.
 *
 * `new-password` on both inputs is what tells a password manager to offer to
 * generate and then store one, rather than autofilling the old password it
 * already has — which is the opposite of what this page is for.
 */
export function PasswordFields() {
  const { pending } = useFormStatus();

  return (
    <>
      <label htmlFor="password">New password</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        autoFocus
      />

      <label htmlFor="confirm">Confirm new password</label>
      <input
        id="confirm"
        name="confirm"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
      />

      <button type="submit" className="admin-primary" disabled={pending}>
        {pending ? "Saving…" : "Set password"}
      </button>
    </>
  );
}
