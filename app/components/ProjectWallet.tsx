"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "../data/portfolio";
import { useIsNarrow } from "./useIsNarrow";

/**
 * Projects as cards in a wallet.
 *
 * This replaces a fanned deck of absolutely-pinned 264px cards. That deck read
 * well on a desktop and badly on a phone: the offsets that produced the fan ran
 * past a narrow viewport, so below 620px it collapsed into three plain stacked
 * boxes — a tall, inert block with a float animation still wobbling on it.
 *
 * A wallet does not have that failure mode. The cards stack on one axis rather
 * than spreading across two, so the layout is identical at every width; only
 * the numbers below shrink. The metaphor also does real work: a stack whose top
 * card is pulled out and whose others peek from behind the pocket says "there
 * are more of these" without having to show them.
 */

type Metrics = {
  /** Card height. Fixed, like a real card — see the note on `height` below. */
  card: number;
  /** Where the pulled-out card rests, measured from the top of the wallet. */
  activeY: number;
  /** How much of each tucked card shows above the one in front of it. */
  peek: number;
  /** Depth of the pocket. Free to be just what its own contents need: the card
   *  layer is clipped at the pocket line, so a tucked card cannot hang out
   *  below the wallet however tall it is. */
  pocket: number;
};

const WIDE: Metrics = { card: 172, activeY: 18, peek: 22, pocket: 98 };
const NARROW: Metrics = { card: 158, activeY: 14, peek: 19, pocket: 92 };

/** How far the cards continue behind the pocket before they are clipped. */
const TUCK_OVERLAP = 26;

/** Slack around the clip so the pulled-out card's shadow is not shaved off.
 *  Must match `--slack` on .wallet-slot. */
const SHADOW_ROOM = 46;

/** Past this many, extra cards stop climbing and sit level with the last. */
const MAX_VISIBLE_DEPTH = 4;

export function ProjectWallet({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const narrow = useIsNarrow();

  const count = projects.length;
  const m = narrow ? NARROW : WIDE;

  // Every tucked card needs its own `peek` of clear space between the bottom of
  // the pulled-out card and the mouth of the pocket, or the card on top covers
  // the slivers that are the whole point. Deriving the pocket line from that
  // rather than hardcoding it is why the wallet holds its shape whether there
  // are two projects or ten.
  const visibleDepth = Math.min(Math.max(count - 1, 0), MAX_VISIBLE_DEPTH);
  const tuckTop = m.activeY + m.card + m.peek * visibleDepth;

  const advance = useCallback(() => {
    setActive((current) => (current + 1) % count);
  }, [count]);

  // Cycling stops on hover or focus so the card cannot change out from under
  // someone reading it or tabbing to its link.
  useEffect(() => {
    if (reduceMotion || paused || count < 2) return;
    const timer = setInterval(advance, 4200);
    return () => clearInterval(timer);
  }, [reduceMotion, paused, count, advance]);

  if (count === 0) return null;

  return (
    <div
      className="wallet"
      role="group"
      aria-label="Project wallet"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      style={{ height: tuckTop + m.pocket }}
    >
      {/* Card layer, clipped just inside the pocket line so the stack is cut
          off by the wallet rather than trailing out below it. See .wallet-slot
          for how the clip is kept clear of the pulled-out card's shadow. */}
      <div className="wallet-slot" style={{ height: SHADOW_ROOM + tuckTop + TUCK_OVERLAP }}>
        {projects.map((project, index) => {
          // Distance from the front of the stack, wrapping — so advancing sends
          // the current card to the back rather than reshuffling everything.
          const depth = (index - active + count) % count;
          const stacked = Math.min(depth, MAX_VISIBLE_DEPTH);
          const isActive = depth === 0;

          return (
            <motion.div
              key={project.slug}
              className={`wallet-card ${project.accent} ${isActive ? "is-out" : ""}`}
              // Tucked cards are decoration: their text is behind the pocket,
              // and a link nobody can see should not take a tab stop.
              aria-hidden={!isActive}
              inert={!isActive}
              // Height is fixed rather than content-driven because the pocket
              // line is computed from it; a card that grew with its tagline
              // would push the stack out of alignment. zIndex is set here
              // rather than animated so it steps cleanly instead of
              // interpolating through fractional values mid-transition.
              style={{ height: m.card, zIndex: count - depth }}
              animate={{
                y: isActive ? m.activeY : tuckTop - m.peek * stacked,
                scale: isActive ? 1 : 1 - stacked * 0.022,
                // A dead-straight stack looks printed; a fraction of a degree
                // reads as cards resting on each other.
                rotate: isActive ? 0 : stacked % 2 === 0 ? 0.6 : -0.6,
              }}
              initial={false}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 250, damping: 30, mass: 0.9 }
              }
            >
              <span className="wallet-edge" aria-hidden="true" />
              <div className="wallet-card-top">
                <span className="wallet-chip">{project.category}</span>
                <span className="wallet-pad" aria-hidden="true" />
              </div>
              <strong>{project.shortTitle}</strong>
              <p>{project.tagline}</p>
              <div className="wallet-stack">
                {project.stack.slice(0, 3).map((item) => (
                  <i key={item}>{item}</i>
                ))}
              </div>
              {isActive && (
                <Link className="wallet-open" href={`/projects/${project.slug}`}>
                  Open case study <b aria-hidden="true">↗</b>
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Drawn last and lifted above every card, so the stack genuinely
          disappears into it instead of merely stopping behind a rectangle. */}
      <div className="wallet-pocket" style={{ height: m.pocket }}>
        <span className="wallet-seam" aria-hidden="true" />
        <div className="wallet-pocket-face">
          <span className="wallet-label">
            Case files <b>{count}</b>
          </span>
          {/* One scrolling row rather than a wrapping grid: the pocket is a
              fixed depth, so a row that wrapped would grow out through it. */}
          <div className="wallet-tabs">
            {projects.map((project, index) => (
              <button
                key={project.slug}
                type="button"
                className={index === active ? "is-on" : ""}
                aria-pressed={index === active}
                onClick={() => setActive(index)}
              >
                {project.shortTitle}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
