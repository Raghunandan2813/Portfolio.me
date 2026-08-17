"use client";

import { useFormStatus } from "react-dom";

/**
 * Show/hide switch for a single row.
 *
 * The visible label is the action ("Hide" / "Show") rather than the state
 * ("Visible" / "Hidden"), because a lone state label leaves you guessing what
 * pressing it does. Current state is carried by the badge in the row header
 * instead, so the two never contradict each other.
 */
function Button({ published, name }: { published: boolean; name: string }) {
  const { pending } = useFormStatus();
  const label = published ? "Hide" : "Show";

  return (
    <button
      type="submit"
      disabled={pending}
      className={published ? "" : "is-restore"}
      // Starts with the visible text, so speech input matching still works.
      aria-label={`${label} ${name}`}
    >
      {pending ? "…" : label}
    </button>
  );
}

export function VisibilityToggle({
  action,
  id,
  published,
  name,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  published: boolean;
  name: string;
}) {
  return (
    <form action={action} className="admin-visibility">
      <input type="hidden" name="id" value={id} />
      {/* The target state, not a flip instruction — see readPublished(). */}
      <input type="hidden" name="published" value={published ? "false" : "true"} />
      <Button published={published} name={name} />
    </form>
  );
}
