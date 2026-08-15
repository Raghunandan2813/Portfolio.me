"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { Project } from "../data/portfolio";

/**
 * Projects hero.
 *
 * The right half used to be empty, which is what made a 510px-tall hero read as
 * a vacant block. It now carries a fanned deck of project cards that float
 * continuously and parallax on scroll, so the space does work: it previews what
 * the page contains instead of padding it.
 */

const headline = ["Three", "products.", "Three", "difficult", "problems."];

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

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const deckY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const deckRotate = useTransform(scrollYProgress, [0, 1], [0, -6]);

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

          {/* Word-by-word rise, so the headline arrives rather than appears. */}
          <h1>
            {headline.map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                className={index >= 2 ? "hero-word muted-word" : "hero-word"}
                initial={reduceMotion ? undefined : { opacity: 0, y: 26 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.07, duration: 0.5, ease: [0.21, 0.6, 0.35, 1] }}
              >
                {word}
                {index === 1 ? <br /> : " "}
              </motion.span>
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

        {/* Fanned deck: one card per project, each drifting on its own loop. */}
        <motion.div
          className="hero-deck"
          style={reduceMotion ? undefined : { y: deckY, rotate: deckRotate }}
          aria-hidden="true"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.slug}
              className={`deck-card deck-${index + 1} ${project.accent}`}
              initial={reduceMotion ? undefined : { opacity: 0, y: 40, rotate: 0 }}
              animate={
                reduceMotion
                  ? undefined
                  : { opacity: 1, y: [0, -14, 0], rotate: [-8, -6, -8][index] }
              }
              transition={{
                opacity: { delay: 0.3 + index * 0.12, duration: 0.6 },
                rotate: { delay: 0.3 + index * 0.12, duration: 0.6 },
                y: {
                  duration: 5.2 + index * 0.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5,
                },
              }}
              whileHover={reduceMotion ? undefined : { scale: 1.04, rotate: 0 }}
            >
              <span className="deck-chip">{project.category}</span>
              <strong>{project.shortTitle}</strong>
              <p>{project.tagline}</p>
              <div className="deck-stack">
                {project.stack.slice(0, 3).map((item) => (
                  <i key={item}>{item}</i>
                ))}
              </div>
              <span className="deck-bar" />
            </motion.div>
          ))}
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
