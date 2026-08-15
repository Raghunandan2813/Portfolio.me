import type { Project } from "../data/portfolio";
import { ProjectVideo } from "./ProjectVideo";

export function ProjectMedia({ project, compact = false }: { project: Project; compact?: boolean }) {
  if (project.demoVideo) {
    return <ProjectVideo project={project} compact={compact} />;
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
