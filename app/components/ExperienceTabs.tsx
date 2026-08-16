"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Experience } from "@/lib/experiences";
import { ExperienceDetails } from "./ExperienceDetails";

/**
 * Experience as a company rail plus one detail panel.
 *
 * A stacked list grew by a whole card for every role added, so the section got
 * taller the longer the career. Here each new role costs one row in the rail
 * and nothing else — the panel shows a single position at a time, so the
 * section's height is set by the longest role rather than the sum of them.
 *
 * Implements the ARIA tabs pattern properly, including roving tabindex and
 * arrow-key navigation: the rail is a real tablist, not buttons that look
 * like one.
 */
export function ExperienceTabs({ experiences }: { experiences: Experience[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useReducedMotion();

  const current = experiences[active];
  if (!current) return null;

  function select(next: number) {
    const index = ((next % experiences.length) + experiences.length) % experiences.length;
    setActive(index);
    // Move focus with selection, which is what a tablist is expected to do
    // when navigating by keyboard.
    tabRefs.current[index]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const keys: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: experiences.length - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
  }

  return (
    <div className="exp-tabs">
      <div
        className="exp-tablist"
        role="tablist"
        aria-label="Companies"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        {experiences.map((experience, index) => (
          <button
            key={experience.id}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`exp-tab-${experience.id}`}
            aria-controls={`exp-panel-${experience.id}`}
            aria-selected={index === active}
            // Roving tabindex: one stop for the whole rail, then arrow keys.
            tabIndex={index === active ? 0 : -1}
            className={index === active ? "is-active" : ""}
            onClick={() => setActive(index)}
          >
            <span className={`exp-tab-logo ${experience.logo ? "has-mark" : ""}`}>
              {experience.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={experience.logo} alt="" loading="lazy" />
              ) : (
                experience.monogram
              )}
            </span>
            <span className="exp-tab-copy">
              <strong>{experience.company}</strong>
              <small>{experience.date}</small>
            </span>
            {experience.current && <i aria-label="Current role" />}
          </button>
        ))}
      </div>

      <motion.div
        className="exp-panel"
        role="tabpanel"
        id={`exp-panel-${current.id}`}
        aria-labelledby={`exp-tab-${current.id}`}
        tabIndex={0}
        // Keyed on the role so switching tabs replays the transition rather
        // than mutating text in place, which reads as a glitch.
        key={current.id}
        initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.21, 0.6, 0.35, 1] }}
      >
        <div className="exp-panel-head">
          <div>
            <h3>{current.role}</h3>
            <p>
              {current.linkedin ? (
                <a className="company-link" href={current.linkedin} target="_blank" rel="noreferrer">
                  {current.company} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                current.company
              )}
            </p>
          </div>
          {current.current && <span className="exp-panel-badge">Current</span>}
        </div>

        <small className="exp-panel-meta">
          {[current.date, current.location].filter(Boolean).join(" · ")}
        </small>

        {current.description && <p className="exp-panel-summary">{current.description}</p>}
        {current.points.length > 0 && <ExperienceDetails points={current.points} />}

        {current.skills.length > 0 && (
          <div className="experience-skills">
            {current.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
