"use client";

import { useRef, useState } from "react";
import type { Project } from "../data/portfolio";

/**
 * Video card with a custom cover.
 *
 * A bare <video controls> renders as a flat rectangle with a thin browser
 * chrome strip, which is what made these tiles look unfinished. The cover adds
 * the project's identity and a real play affordance, then gets out of the way
 * on first play so the native controls take over — no reimplementing scrubbing,
 * volume or fullscreen.
 */
export function ProjectVideo({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function play() {
    setStarted(true);
    void videoRef.current?.play();
  }

  return (
    <div className={`video-shell ${project.accent} ${compact ? "compact" : ""}`}>
      <video
        ref={videoRef}
        className="project-video"
        controls={started}
        preload="metadata"
        playsInline
        poster={project.demoPoster ?? undefined}
        onPlay={() => setStarted(true)}
        aria-label={`${project.title} product demo`}
      >
        <source src={project.demoVideo ?? ""} type="video/mp4" />
        Your browser does not support embedded video.
      </video>

      {!started && (
        <button className="video-cover" type="button" onClick={play}>
          <span className="video-glow" aria-hidden="true" />
          <span className="video-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M9 6.5 18 12l-9 5.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="video-caption">
            <b>{project.shortTitle}</b>
            <small>
              {project.category}
              {project.demoLength ? ` · ${project.demoLength}` : ""}
            </small>
          </span>
          <span className="video-cta">Watch demo</span>
          <span className="sr-only">
            Play the {project.title} demo video
          </span>
        </button>
      )}

      <span className="video-badge" aria-hidden="true">
        <i /> Live demo
      </span>
    </div>
  );
}
