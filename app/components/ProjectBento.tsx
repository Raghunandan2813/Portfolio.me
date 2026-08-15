"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { Project } from "../data/portfolio";
import { ProjectMedia } from "./ProjectMedia";

/**
 * Bento archive for the projects page.
 *
 * "Flow motion" here is scroll-linked rather than fire-once: each tile's media
 * drifts at its own rate as the tile passes through the viewport, so the grid
 * keeps moving with the scroll instead of animating in and then sitting still.
 */

const springy = { type: "spring" as const, stiffness: 260, damping: 26 };

function Tile({
  project,
  index,
  span,
}: {
  project: Project;
  index: number;
  span: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // Progress of this specific tile through the viewport, 0 as it enters from
  // the bottom to 1 as it leaves past the top.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Alternate drift direction so neighbouring tiles counter-move.
  const drift = index % 2 === 0 ? 26 : -20;
  const rawY = useTransform(scrollYProgress, [0, 1], [drift, -drift]);
  const mediaY = useSpring(rawY, { stiffness: 90, damping: 22, mass: 0.4 });

  const featured = index === 0;

  return (
    <motion.article
      ref={ref}
      className={`bento-tile ${span} ${project.accent} ${featured ? "is-featured" : ""}`}
      initial={reduceMotion ? undefined : { opacity: 0, y: 42, scale: 0.97 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.18 }}
      transition={{ ...springy, delay: index * 0.07 }}
      whileHover={reduceMotion ? undefined : { y: -8 }}
    >
      <span className="bento-sheen" aria-hidden="true" />

      <motion.div className="bento-media" style={reduceMotion ? undefined : { y: mediaY }}>
        <ProjectMedia project={project} compact={!featured} />
      </motion.div>

      <div className="bento-copy">
        <div className="bento-meta">
          <span className="bento-index">0{index + 1}</span>
          <span className="bento-category">{project.category}</span>
        </div>
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <div className="bento-stack">
          {project.stack.slice(0, featured ? 6 : 4).map((item) => (
            <i key={item}>{item}</i>
          ))}
        </div>
        <div className="bento-links">
          <Link className="bento-primary" href={`/projects/${project.slug}`}>
            Read case study <b aria-hidden="true">↗</b>
          </Link>
          <a href={project.githubUrl} target="_blank" rel="noreferrer">
            Source
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectBento({ projects }: { projects: Project[] }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], ["-12%", "26%"]);

  // First tile is wide and tall; the other two stack beside it.
  const spans = ["span-wide", "span-side", "span-side", "span-half", "span-half"];

  return (
    <div className="bento-wrap" ref={ref} id="case-studies">
      {!reduceMotion && (
        <motion.span className="bento-glow" style={{ y: glowY }} aria-hidden="true" />
      )}
      <div className="bento-grid">
        {projects.map((project, index) => (
          <Tile
            key={project.slug}
            project={project}
            index={index}
            span={spans[index] ?? "span-half"}
          />
        ))}
      </div>
    </div>
  );
}
