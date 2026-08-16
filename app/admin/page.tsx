import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { listExperiences } from "@/lib/experiences";
import { listProjectRows } from "@/lib/projects";
import {
  createExperience,
  createProject,
  deleteExperience,
  deleteProject,
  updateExperience,
  updateProject,
} from "./actions";
import { ExperienceForm } from "./ExperienceForm";
import { ProjectForm } from "./ProjectForm";
import { SignOut } from "./SignOut";

export const metadata: Metadata = { robots: { index: false, follow: false } };
// Always reflect the current table, never a cached copy.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  const [roles, projectRows] = await Promise.all([listExperiences(), listProjectRows()]);

  return (
    <main className="admin-shell">
      <header className="admin-head">
        <div>
          <span className="eyebrow">Portfolio admin</span>
          <h1>Content</h1>
          <p className="admin-note">
            Signed in as {admin.email}. Changes appear on the live site immediately.
          </p>
        </div>
        <div className="admin-head-actions">
          <Link className="admin-ghost" href="/">View site ↗</Link>
          <SignOut />
        </div>
      </header>

      <section className="admin-section">
        <h2>Add a role</h2>
        <ExperienceForm action={createExperience} submitLabel="Add role" />
      </section>

      <section className="admin-section">
        <h2>Current roles <i>{roles.length}</i></h2>
        {roles.length === 0 && <p className="admin-note">No roles yet.</p>}
        <div className="admin-list">
          {roles.map((role) => (
            <details key={role.id} className="admin-item">
              <summary>
                <strong>{role.role}</strong>
                <span>{role.company}</span>
                {role.current && <i>Current</i>}
              </summary>
              <ExperienceForm
                action={updateExperience}
                submitLabel="Save changes"
                experience={role}
              />
              <form action={deleteExperience} className="admin-delete">
                <input type="hidden" name="id" value={role.id} />
                <button type="submit">Delete this role</button>
              </form>
            </details>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h2>Add a project</h2>
        <details className="admin-item">
          <summary><strong>New project</strong><span>Opens the full form</span></summary>
          <div className="admin-form-wrap">
            <ProjectForm action={createProject} submitLabel="Add project" />
          </div>
        </details>
      </section>

      <section className="admin-section">
        <h2>Current projects <i>{projectRows.length}</i></h2>
        {projectRows.length === 0 && <p className="admin-note">No projects yet.</p>}
        <div className="admin-list">
          {projectRows.map((project) => (
            <details key={project.id} className="admin-item">
              <summary>
                <strong>{project.shortTitle || project.title}</strong>
                <span>/projects/{project.slug}</span>
              </summary>
              <div className="admin-form-wrap">
                <ProjectForm action={updateProject} submitLabel="Save changes" project={project} />
              </div>
              <form action={deleteProject} className="admin-delete">
                <input type="hidden" name="id" value={project.id} />
                <button type="submit">Delete this project</button>
              </form>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
