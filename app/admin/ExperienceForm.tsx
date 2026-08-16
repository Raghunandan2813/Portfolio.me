"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Experience } from "@/lib/experiences";
import { lookupLogo } from "./actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admin-primary" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

function LookupButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admin-ghost" disabled={pending}>
      {pending ? "Looking…" : "Fetch logo"}
    </button>
  );
}

export function ExperienceForm({
  action,
  submitLabel,
  experience,
}: {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  experience?: Experience;
}) {
  const [logoUrl, setLogoUrl] = useState(experience?.logo ?? "");
  const [lookup, runLookup] = useActionState(lookupLogo, null);

  // The action returns the stored URL; adopt it without clobbering a value the
  // user has since typed by hand.
  const resolvedLogo = lookup?.logoUrl ?? logoUrl;

  return (
    <div className="admin-form-wrap">
      {/* Separate form: nesting one inside the main form is invalid HTML and
          would submit the role on every lookup. */}
      <form action={runLookup} className="admin-lookup">
        <label htmlFor={`domain-${experience?.id ?? "new"}`}>Company website</label>
        <div>
          <input
            id={`domain-${experience?.id ?? "new"}`}
            name="domain"
            placeholder="snorkel.ai"
            defaultValue=""
          />
          <LookupButton />
        </div>
        {lookup?.message && <small className="admin-lookup-msg">{lookup.message}</small>}
      </form>

      <form action={action} className="admin-form">
        {experience && <input type="hidden" name="id" value={experience.id} />}

        <div className="admin-row">
          <div>
            <label htmlFor={`company-${experience?.id ?? "new"}`}>Company *</label>
            <input
              id={`company-${experience?.id ?? "new"}`}
              name="company"
              required
              defaultValue={experience?.company ?? ""}
            />
          </div>
          <div>
            <label htmlFor={`role-${experience?.id ?? "new"}`}>Role *</label>
            <input
              id={`role-${experience?.id ?? "new"}`}
              name="role"
              required
              defaultValue={experience?.role ?? ""}
            />
          </div>
        </div>

        <div className="admin-row">
          <div>
            <label htmlFor={`date-${experience?.id ?? "new"}`}>Dates</label>
            <input
              id={`date-${experience?.id ?? "new"}`}
              name="date"
              placeholder="July 2026 - Present"
              defaultValue={experience?.date ?? ""}
            />
          </div>
          <div>
            <label htmlFor={`location-${experience?.id ?? "new"}`}>Location</label>
            <input
              id={`location-${experience?.id ?? "new"}`}
              name="location"
              placeholder="Remote · San Francisco, USA"
              defaultValue={experience?.location ?? ""}
            />
          </div>
        </div>

        <label htmlFor={`logo-${experience?.id ?? "new"}`}>Logo URL</label>
        <input
          id={`logo-${experience?.id ?? "new"}`}
          name="logoUrl"
          value={resolvedLogo}
          onChange={(event) => setLogoUrl(event.target.value)}
          placeholder="Fetched above, or paste a URL"
        />
        {resolvedLogo && (
          // Plain img, not next/image: the host is user-supplied and cannot be
          // in the remotePatterns allowlist ahead of time.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="admin-logo-preview" src={resolvedLogo} alt="" />
        )}

        <label htmlFor={`linkedin-${experience?.id ?? "new"}`}>LinkedIn company URL</label>
        <input
          id={`linkedin-${experience?.id ?? "new"}`}
          name="linkedinUrl"
          placeholder="https://www.linkedin.com/company/…"
          defaultValue={experience?.linkedin ?? ""}
        />
        <small className="admin-hint">
          Paste this from LinkedIn. It cannot be derived from the company name —
          Outlier&apos;s page is <code>/company/try-outlier</code>, not <code>/company/outlier</code>.
        </small>

        <label htmlFor={`points-${experience?.id ?? "new"}`}>Bullet points (one per line)</label>
        <textarea
          id={`points-${experience?.id ?? "new"}`}
          name="points"
          rows={6}
          defaultValue={experience?.points.join("\n") ?? ""}
        />
        <small className="admin-hint">
          The first bullet always shows; the rest fold behind &ldquo;Show more&rdquo;.
        </small>

        <label htmlFor={`skills-${experience?.id ?? "new"}`}>Tech stack (comma separated)</label>
        <textarea
          id={`skills-${experience?.id ?? "new"}`}
          name="skills"
          rows={3}
          defaultValue={experience?.skills.join(", ") ?? ""}
        />

        <label htmlFor={`description-${experience?.id ?? "new"}`}>
          Summary paragraph (optional)
        </label>
        <textarea
          id={`description-${experience?.id ?? "new"}`}
          name="description"
          rows={2}
          defaultValue={experience?.description ?? ""}
        />

        <div className="admin-row admin-row-tight">
          <label className="admin-check">
            <input type="checkbox" name="current" defaultChecked={experience?.current ?? false} />
            Currently working here
          </label>
          <div>
            <label htmlFor={`sort-${experience?.id ?? "new"}`}>Sort order</label>
            <input
              id={`sort-${experience?.id ?? "new"}`}
              name="sortOrder"
              type="number"
              defaultValue={experience ? undefined : 0}
              placeholder="0 = first"
            />
          </div>
        </div>

        <Submit label={submitLabel} />
      </form>
    </div>
  );
}
