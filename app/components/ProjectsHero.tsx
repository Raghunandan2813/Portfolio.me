"use client";

import { Fragment, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { Project } from "../data/portfolio";
import { ProjectWallet } from "./ProjectWallet";
import { useIsNarrow } from "./useIsNarrow";

/**
 * Projects hero.
 *
 * The right half used to be empty, which is what made a 510px-tall hero read as
 * a vacant block. It now carries a wallet of project cards, so the space does
 * work: it previews what the page contains instead of padding it.
 */

/**
 * The headline counts the projects out loud, so it has to be derived rather
 * than written down: hiding one in the admin would otherwise leave the page
 * saying "Three products." above two of them.
 */
const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

function countWord(count: number) {
  return NUMBER_WORDS[count] ?? String(count);
}

export function ProjectsHero({
  projects,
  stats,
  resumePath,
}: {
  projects: Project[];
  stats: { value: string; label: string }[];
  resumePath: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const narrow = useIsNarrow();
  // Scroll-linked drift is dropped on phones: the wallet spans the full column
  // there, so shifting it as you scroll reads as the layout sliding rather than
  // as depth, and it fights the browser's own scrolling on touch.
  const still = reduceMotion || narrow;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const deckY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const deckRotate = useTransform(scrollYProgress, [0, 1], [0, -4]);

  const word = countWord(projects.length);
  const headline = [
    word,
    projects.length === 1 ? "product." : "products.",
    word,
    "difficult",
    projects.length === 1 ? "problem." : "problems.",
  ];

  return (
    <motion.section
      ref={ref}
      className="projects-hero"
      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.21, 0.6, 0.35, 1] }}
    >
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">Product archive · 2025-2026</span>

          {/* Word-by-word rise, so the headline arrives rather than appears.
              The separator sits outside the span deliberately: .hero-word is an
              inline-block, and a trailing space inside one is trimmed as
              end-of-line whitespace, which ran the words together. */}
          <h1>
            {headline.map((word, index) => (
              <Fragment key={`${word}-${index}`}>
                <motion.span
                  className={index >= 2 ? "hero-word muted-word" : "hero-word"}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 26 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.07, duration: 0.5, ease: [0.21, 0.6, 0.35, 1] }}
                >
                  {word}
                </motion.span>
                {index === 1 ? <br /> : " "}
              </Fragment>
            ))}
          </h1>

          <motion.p
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Full case studies covering the problem, system design, core
            engineering decisions, stack, working product, source code, and an
            embedded on-site demo.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <a className="primary-action" href="#case-studies">
              Explore case studies ↓
            </a>
            <a className="outline-action" href={resumePath} download>
              Download resume
            </a>
          </motion.div>

          <div className="hero-stats">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.72 + index * 0.08, duration: 0.45 }}
              >
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* One card per project, stacked in a wallet with the current one
            pulled out. */}
        <motion.div
          className="hero-deck"
          style={still ? undefined : { y: deckY, rotate: deckRotate }}
        >
          <ProjectWallet projects={projects} />
        </motion.div>
      </div>

      {/* Continuous tech marquee anchoring the bottom edge. */}
      <div className="hero-marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div className="marquee-group" key={copy}>
              {[
                "Next.js", "TypeScript", "LangGraph", "pgvector", "Supabase",
                "Groq", "WebContainer", "CodeMirror 6", "Redis", "Convex",
                "Vapi", "PostgreSQL",
              ].map((tech) => (
                <span key={`${copy}-${tech}`}>{tech}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
