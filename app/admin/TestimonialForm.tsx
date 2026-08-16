"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { TestimonialRow } from "@/db/schema";
import { uploadPhoto } from "./actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admin-primary" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admin-ghost" disabled={pending}>
      {pending ? "Uploading…" : "Upload photo"}
    </button>
  );
}

/** Radio group styled as stars: keyboard-navigable and works without JS. */
function StarRating({ name, value, onChange }: { name: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="admin-stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <label key={star} className={star <= value ? "is-on" : ""}>
          <input
            type="radio"
            name={name}
            value={star}
            checked={value === star}
            onChange={() => onChange(star)}
          />
          <span aria-hidden="true">★</span>
          <i className="sr-only">{star} star{star > 1 ? "s" : ""}</i>
        </label>
      ))}
      <b>{value} / 5</b>
    </div>
  );
}

export function TestimonialForm({
  action,
  submitLabel,
  testimonial,
}: {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  testimonial?: TestimonialRow;
}) {
  const key = testimonial?.id ?? "new";
  const [rating, setRating] = useState(testimonial?.rating ?? 5);
  const [photoUrl, setPhotoUrl] = useState(testimonial?.photoUrl ?? "");
  const [upload, runUpload] = useActionState(uploadPhoto, null);

  const resolvedPhoto = upload?.photoUrl ?? photoUrl;

  return (
    <div className="admin-form-wrap">
      {/* Separate form: nesting forms is invalid HTML, and an upload should not
          submit the testimonial. */}
      <form action={runUpload} className="admin-lookup">
        <label htmlFor={`photo-${key}`}>Portrait</label>
        <div>
          <input id={`photo-${key}`} name="photo" type="file" accept="image/*" />
          <UploadButton />
        </div>
        <small className="admin-lookup-msg">
          {upload?.message ??
            "LinkedIn blocks automated photo fetching, so save the picture and upload it here."}
        </small>
      </form>

      <form action={action} className="admin-form">
        {testimonial && <input type="hidden" name="id" value={testimonial.id} />}

        <div className="admin-row">
          <div>
            <label htmlFor={`name-${key}`}>Name *</label>
            <input id={`name-${key}`} name="name" required defaultValue={testimonial?.name ?? ""} />
          </div>
          <div>
            <label htmlFor={`ttitle-${key}`}>Job title</label>
            <input
              id={`ttitle-${key}`}
              name="title"
              placeholder="Founder"
              defaultValue={testimonial?.title ?? ""}
            />
          </div>
        </div>

        <div className="admin-row">
          <div>
            <label htmlFor={`tcompany-${key}`}>Company</label>
            <input id={`tcompany-${key}`} name="company" defaultValue={testimonial?.company ?? ""} />
          </div>
          <div>
            <label htmlFor={`tsort-${key}`}>Sort order</label>
            <input
              id={`tsort-${key}`}
              name="sortOrder"
              type="number"
              defaultValue={testimonial?.sortOrder ?? 0}
            />
          </div>
        </div>

        <label htmlFor={`quote-${key}`}>Quote *</label>
        <textarea
          id={`quote-${key}`}
          name="quote"
          rows={7}
          required
          defaultValue={testimonial?.quote ?? ""}
        />

        <label>Rating</label>
        <StarRating name="rating" value={rating} onChange={setRating} />

        <label htmlFor={`tphoto-${key}`}>Photo URL</label>
        <input
          id={`tphoto-${key}`}
          name="photoUrl"
          value={resolvedPhoto}
          onChange={(event) => setPhotoUrl(event.target.value)}
          placeholder="Filled in by the upload above"
        />
        {resolvedPhoto && (
          // Plain img: the host is whatever Supabase Storage returns, which
          // cannot be listed in next/image remotePatterns ahead of the build.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="admin-photo-preview" src={resolvedPhoto} alt="" />
        )}

        <label htmlFor={`tlinkedin-${key}`}>LinkedIn profile URL</label>
        <input
          id={`tlinkedin-${key}`}
          name="linkedinUrl"
          placeholder="https://www.linkedin.com/in/…"
          defaultValue={testimonial?.linkedinUrl ?? ""}
        />

        <Submit label={submitLabel} />
      </form>
    </div>
  );
}
