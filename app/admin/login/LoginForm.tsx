"use client";

import { useFormStatus } from "react-dom";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admin-primary" disabled={pending}>
      {pending ? "Sending…" : "Email me a link"}
    </button>
  );
}

export function LoginForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="admin-form">
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Submit />
    </form>
  );
}
