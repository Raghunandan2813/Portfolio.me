"use client";

import { useId, useState } from "react";

export type ExperienceDetail = { title: string; body: string };

/**
 * Collapsible detail for a role.
 *
 * The long write-up would otherwise dominate the feed and push every later
 * section below the fold, so it stays folded until asked for. The summary
 * sentence above it always shows, which means the collapsed state still says
 * something useful rather than being a bare "Read more" with no context.
 */
export function ExperienceDetails({
  details,
  stack,
}: {
  details: ExperienceDetail[];
  stack?: string;
}) {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  return (
    <div className="exp-details">
      <button
        type="button"
        className="exp-toggle"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Read less" : `Read more · ${details.length} highlights`}
        <b aria-hidden="true">{open ? "↑" : "↓"}</b>
      </button>

      {/* Kept out of the DOM when closed rather than hidden with CSS, so the
          collapsed copy is not read out by screen readers or picked up as
          page text. */}
      {open && (
        <div className="exp-detail-body" id={regionId}>
          <ol>
            {details.map((detail) => (
              <li key={detail.title}>
                <strong>{detail.title}</strong>
                <p>{detail.body}</p>
              </li>
            ))}
          </ol>
          {stack && (
            <p className="exp-detail-stack">
              <span>Tech stack</span>
              {stack}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
