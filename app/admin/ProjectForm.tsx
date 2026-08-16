"use client";

import { useFormStatus } from "react-dom";
import type { ProjectRow } from "@/db/schema";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admin-primary" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ProjectForm({
  action,
  submitLabel,
  project,
}: {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  project?: ProjectRow;
}) {
  const key = project?.id ?? "new";
  const highlightText = (project?.highlights ?? [])
    .map((h) => [h.title, h.mechanism, h.use].filter(Boolean).join(" | "))
    .join("\n");

  return (
    <form action={action} className="admin-form">
      {project && <input type="hidden" name="id" value={project.id} />}

      <div className="admin-row">
        <div>
          <label htmlFor={`title-${key}`}>Title *</label>
          <input id={`title-${key}`} name="title" required defaultValue={project?.title ?? ""} />
        </div>
        <div>
          <label htmlFor={`slug-${key}`}>Slug</label>
          <input
            id={`slug-${key}`}
            name="slug"
            placeholder="auto from title"
            defaultValue={project?.slug ?? ""}
          />
        </div>
      </div>
      <small className="admin-hint">
        The slug is the page URL, <code>/projects/&lt;slug&gt;</code>. Changing it on an existing
        project changes that URL and breaks any link already pointing at the old one.
      </small>

      <div className="admin-row">
        <div>
          <label htmlFor={`short-${key}`}>Short title</label>
          <input
            id={`short-${key}`}
            name="shortTitle"
            placeholder="Shown on cards"
            defaultValue={project?.shortTitle ?? ""}
          />
        </div>
        <div>
          <label htmlFor={`category-${key}`}>Category</label>
          <input
            id={`category-${key}`}
            name="category"
            placeholder="Agentic AI / SaaS"
            defaultValue={project?.category ?? ""}
          />
        </div>
      </div>

      <label htmlFor={`tagline-${key}`}>Tagline</label>
      <input id={`tagline-${key}`} name="tagline" defaultValue={project?.tagline ?? ""} />

      <label htmlFor={`summary-${key}`}>Summary</label>
      <textarea id={`summary-${key}`} name="summary" rows={2} defaultValue={project?.summary ?? ""} />

      <label htmlFor={`problem-${key}`}>The problem</label>
      <textarea id={`problem-${key}`} name="problem" rows={3} defaultValue={project?.problem ?? ""} />

      <label htmlFor={`solution-${key}`}>The solution</label>
      <textarea id={`solution-${key}`} name="solution" rows={3} defaultValue={project?.solution ?? ""} />

      <label htmlFor={`highlights-${key}`}>Highlights — one per line</label>
      <textarea
        id={`highlights-${key}`}
        name="highlights"
        rows={6}
        placeholder="Title | Mechanism | Use"
        defaultValue={highlightText}
      />
      <small className="admin-hint">
        Format each line as <code>Title | Mechanism | Use</code>. The third part is optional.
      </small>

      <label htmlFor={`stack-${key}`}>Stack (comma separated)</label>
      <textarea id={`stack-${key}`} name="stack" rows={2} defaultValue={(project?.stack ?? []).join(", ")} />

      <div className="admin-row">
        <div>
          <label htmlFor={`live-${key}`}>Live URL</label>
          <input
            id={`live-${key}`}
            name="liveUrl"
            placeholder="Leave blank to hide the button"
            defaultValue={project?.liveUrl ?? ""}
          />
        </div>
        <div>
          <label htmlFor={`github-${key}`}>GitHub URL</label>
          <input id={`github-${key}`} name="githubUrl" defaultValue={project?.githubUrl ?? ""} />
        </div>
      </div>

      <div className="admin-row">
        <div>
          <label htmlFor={`video-${key}`}>Demo video path</label>
          <input
            id={`video-${key}`}
            name="demoVideo"
            placeholder="/videos/demo.mp4"
            defaultValue={project?.demoVideo ?? ""}
          />
        </div>
        <div>
          <label htmlFor={`poster-${key}`}>Poster image path</label>
          <input
            id={`poster-${key}`}
            name="demoPoster"
            placeholder="/videos/demo-poster.jpg"
            defaultValue={project?.demoPoster ?? ""}
          />
        </div>
      </div>
      <small className="admin-hint">
        Videos are committed to <code>/public</code>, not uploaded here — they are far larger than
        a form post should carry, and they belong in the repo alongside the code.
      </small>

      <div className="admin-row">
        <div>
          <label htmlFor={`length-${key}`}>Demo length</label>
          <input
            id={`length-${key}`}
            name="demoLength"
            placeholder="2 min"
            defaultValue={project?.demoLength ?? ""}
          />
        </div>
        <div>
          <label htmlFor={`accent-${key}`}>Accent</label>
          <select id={`accent-${key}`} name="accent" defaultValue={project?.accent ?? "violet"}>
            <option value="violet">Violet</option>
            <option value="blue">Blue</option>
            <option value="orange">Orange</option>
          </select>
        </div>
      </div>

      <div className="admin-row">
        <div>
          <label htmlFor={`psort-${key}`}>Sort order</label>
          <input
            id={`psort-${key}`}
            name="sortOrder"
            type="number"
            defaultValue={project?.sortOrder ?? 0}
          />
        </div>
        <div />
      </div>

      <Submit label={submitLabel} />
    </form>
  );
}
