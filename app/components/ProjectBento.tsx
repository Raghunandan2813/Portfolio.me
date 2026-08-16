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
import { useIsNarrow } from "./useIsNarrow";

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
  const narrow = useIsNarrow();
  // Parallax is dropped on phones: a tile fills the viewport there, so the
  // media drifting inside it reads as the layout wobbling rather than depth,
  // and driving a transform from scroll competes with the browser's own
  // scrolling on touch.
  const still = reduceMotion || narrow;

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
      initial={reduceMotion ? undefined : { opacity: 0, y: narrow ? 22 : 42, scale: narrow ? 1 : 0.97 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: narrow ? 0.08 : 0.18 }}
      transition={
        narrow
          ? { duration: 0.45, ease: [0.21, 0.6, 0.35, 1], delay: index * 0.05 }
          : { ...springy, delay: index * 0.07 }
      }
      whileHover={still ? undefined : { y: -8 }}
    >
      <span className="bento-sheen" aria-hidden="true" />

      <motion.div className="bento-media" style={still ? undefined : { y: mediaY }}>
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
  const narrow = useIsNarrow();
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
      {!reduceMotion && !narrow && (
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
