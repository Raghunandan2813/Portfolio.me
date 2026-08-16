"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { useIsNarrow } from "./useIsNarrow";

type Direction = "up" | "down" | "left" | "right" | "scale";

type RevealProps = {
  children: ReactNode;
  /** Which way the element travels in from. */
  from?: Direction;
  /** Seconds to wait before animating, for staggering siblings. */
  delay?: number;
  /** Fraction of the element that must be visible to trigger. */
  amount?: number;
  className?: string;
  as?: "div" | "section" | "article" | "aside" | "li";
  /** Anchor target, so in-page nav links still land on the right section. */
  id?: string;
};

const offsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 34 },
  down: { y: -34 },
  left: { x: -38 },
  right: { x: 38 },
  scale: { scale: 0.94 },
};

/**
 * Phone viewports get vertical motion only. Horizontal travel pushes a
 * full-width element past the right edge, which makes the whole page scroll
 * sideways, and the sideways slide reads as jitter at that size anyway.
 */
function resolveOffset(from: Direction, narrow: boolean) {
  if (!narrow) return offsets[from];
  if (from === "scale") return { scale: 0.97 };
  return { y: 20 };
}

/**
 * Scroll-linked reveal.
 *
 * `once: false` is deliberate: the animation replays whenever the element
 * re-enters the viewport, so scrolling back up feels as alive as scrolling
 * down. `amount` is kept low so tall sections trigger as soon as their top
 * edge appears rather than waiting to be nearly full-screen.
 */
export function Reveal({
  children,
  from = "up",
  delay = 0,
  amount = 0.15,
  className,
  as = "div",
  id,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const narrow = useIsNarrow();
  const MotionTag = motion[as];

  // Respect the OS setting: no travel, no fade, no delay.
  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className} id={id}>{children}</Tag>;
  }

  // Note: `narrow` is false during SSR and corrects on hydration, but Motion
  // only applies a variant on a state change — so elements still below the
  // fold keep the desktop `x: ±38` until they scroll into view. The stylesheet
  // clips that travel on narrow viewports rather than let it widen the page.
  const variants: Variants = {
    hidden: { opacity: 0, ...resolveOffset(from, narrow) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: narrow ? 0.42 : 0.55,
        delay: narrow ? 0 : delay,
        ease: [0.21, 0.6, 0.35, 1],
      },
    },
  };

  return (
    <MotionTag
      className={className}
      id={id}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount, margin: "-40px 0px -40px 0px" }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Wraps a list so children animate in sequence. Pair with `RevealItem`.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  amount = 0.1,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();
  const narrow = useIsNarrow();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount }}
      variants={{
        hidden: {},
        // Tighter stagger on phones; long chains feel sluggish when each card
        // fills the screen.
        visible: { transition: { staggerChildren: narrow ? stagger * 0.5 : stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  from = "up",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  from?: Direction;
  /** Match the tag the stylesheet expects, e.g. `.experience-list > article`. */
  as?: "div" | "article" | "li";
}) {
  const reduceMotion = useReducedMotion();
  const narrow = useIsNarrow();
  const MotionTag = motion[as];

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, ...resolveOffset(from, narrow) },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: { duration: narrow ? 0.4 : 0.5, ease: [0.21, 0.6, 0.35, 1] },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
