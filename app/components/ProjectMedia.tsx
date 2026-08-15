import type { Project } from "../data/portfolio";

export function ProjectMedia({ project, compact = false }: { project: Project; compact?: boolean }) {
  if (project.demoVideo) {
    return (
      <video
        className="project-video"
        controls
        // "metadata" fetches only the header, so the page is not charged the
        // full file size for a video the visitor may never play.
        preload="metadata"
        playsInline
        // Deliberately not muted or looped: these are narrated long-form
        // walkthroughs, so audio matters and the clip should end rather than
        // restart. Short silent loops would want the opposite.
        poster={project.demoPoster ?? undefined}
        aria-label={`${project.title} product demo`}
      >
        <source src={project.demoVideo} type="video/mp4" />
        Your browser does not support embedded video.
      </video>
    );
  }

  return (
    <div className={`product-frame ${project.accent} ${compact ? "compact" : ""}`} aria-label={`${project.title} interface preview`}>
      <div className="mock-browser">
        <div className="mock-top"><span><i /><i /><i /></span><b>{project.shortTitle}</b><em>Live product</em></div>
        <div className="mock-body">
          <div className="mock-rail"><i /><i /><i /><i /></div>
          <div className="mock-canvas">
            <span className="mock-chip">{project.category}</span>
            <strong>{project.tagline}</strong>
            <div className="mock-lines"><i /><i /><i /></div>
            <div className="mock-widget"><span /><b /><em /></div>
          </div>
        </div>
      </div>
      <span className="media-ready"><b>▶</b> Local demo slot ready</span>
    </div>
  );
}
