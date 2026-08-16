"use client";

import { useId, useState } from "react";

/**
 * Bulleted detail for a role, with all but the first point folded away.
 *
 * The first bullet always shows: a collapsed block that says nothing but
 * "Show more" gives a reader no reason to open it, whereas leading with one
 * real point lets them judge whether the rest is worth their time.
 */
export function ExperienceDetails({ points }: { points: string[] }) {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  const [first, ...rest] = points;

  return (
    <div className="exp-details">
      <ul className="exp-bullets">
        <li>{first}</li>
        {/* Unmounted rather than CSS-hidden when closed, so the folded copy
            stays out of the DOM and the accessibility tree. It is still
            serialised into the RSC payload as props, so this is about how the
            page reads, not about withholding the text. */}
        {open && (
          <li className="exp-bullets-more" id={regionId}>
            <ul>
              {rest.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </li>
        )}
      </ul>

      {rest.length > 0 && (
        <button
          type="button"
          className="exp-toggle"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Show less" : `Show ${rest.length} more`}
          <b aria-hidden="true">{open ? "↑" : "↓"}</b>
        </button>
      )}
    </div>
  );
}
