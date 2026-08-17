import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { listAllExperiences } from "@/lib/experiences";
import { listProjectRows } from "@/lib/projects";
import { listTestimonialRows } from "@/lib/testimonials";
import {
  createExperience,
  createProject,
  createTestimonial,
  deleteExperience,
  deleteProject,
  deleteTestimonial,
  setExperiencePublished,
  setProjectPublished,
  setTestimonialPublished,
  updateExperience,
  updateProject,
  updateTestimonial,
} from "./actions";
import { ExperienceForm } from "./ExperienceForm";
import { ProjectForm } from "./ProjectForm";
import { TestimonialForm } from "./TestimonialForm";
import { SignOut } from "./SignOut";
import { VisibilityToggle } from "./VisibilityToggle";

export const metadata: Metadata = { robots: { index: false, follow: false } };
// Always reflect the current table, never a cached copy.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  // The admin list shows hidden entries too — that is the whole point of being
  // able to hide something without deleting it.
  const [roles, projectRows, testimonialRows] = await Promise.all([
    listAllExperiences(),
    listProjectRows(),
    listTestimonialRows(),
  ]);
  const hiddenCount =
    roles.filter((role) => !role.published).length +
    projectRows.filter((project) => !project.published).length +
    testimonialRows.filter((testimonial) => !testimonial.published).length;

  return (
    <main className="admin-shell">
      <header className="admin-head">
        <div>
          <span className="eyebrow">Portfolio admin</span>
          <h1>Content</h1>
          <p className="admin-note">
            Signed in as {admin.email}. Changes appear on the live site immediately.
            {hiddenCount > 0 && (
              <>
                {" "}
                <b className="admin-hidden-count">
                  {hiddenCount} {hiddenCount === 1 ? "entry is" : "entries are"} hidden
                </b>{" "}
                — kept in the database, not shown to visitors.
              </>
            )}
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
            <div className="admin-entry" key={role.id}>
              <details className={`admin-item ${role.published ? "" : "is-hidden"}`}>
                <summary>
                  <strong>{role.role}</strong>
                  <span>{role.company}</span>
                  {role.current && <i>Current</i>}
                  {!role.published && <i className="badge-hidden">Hidden</i>}
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
              {/* Sibling rather than a child of <summary>: a form is flow
                  content and is not valid inside it. Positioned over the
                  header row so it stays reachable without expanding. */}
              <VisibilityToggle
                action={setExperiencePublished}
                id={role.id}
                published={role.published}
                name={`${role.role} at ${role.company}`}
              />
            </div>
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
            <div className="admin-entry" key={project.id}>
              <details className={`admin-item ${project.published ? "" : "is-hidden"}`}>
                <summary>
                  <strong>{project.shortTitle || project.title}</strong>
                  <span>/projects/{project.slug}</span>
                  {!project.published && <i className="badge-hidden">Hidden</i>}
                </summary>
                <div className="admin-form-wrap">
                  <ProjectForm action={updateProject} submitLabel="Save changes" project={project} />
                </div>
                <form action={deleteProject} className="admin-delete">
                  <input type="hidden" name="id" value={project.id} />
                  <button type="submit">Delete this project</button>
                </form>
              </details>
              <VisibilityToggle
                action={setProjectPublished}
                id={project.id}
                published={project.published}
                name={project.shortTitle || project.title}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h2>Add a testimonial</h2>
        <details className="admin-item">
          <summary><strong>New testimonial</strong><span>Opens the full form</span></summary>
          <div className="admin-form-wrap">
            <TestimonialForm action={createTestimonial} submitLabel="Add testimonial" />
          </div>
        </details>
      </section>

      <section className="admin-section">
        <h2>Current testimonials <i>{testimonialRows.length}</i></h2>
        {testimonialRows.length === 0 && <p className="admin-note">No testimonials yet.</p>}
        <div className="admin-list">
          {testimonialRows.map((testimonial) => (
            <div className="admin-entry" key={testimonial.id}>
              <details className={`admin-item ${testimonial.published ? "" : "is-hidden"}`}>
                <summary>
                  <strong>{testimonial.name}</strong>
                  <span>{"★".repeat(testimonial.rating)}</span>
                  {!testimonial.published && <i className="badge-hidden">Hidden</i>}
                </summary>
                <div className="admin-form-wrap">
                  <TestimonialForm
                    action={updateTestimonial}
                    submitLabel="Save changes"
                    testimonial={testimonial}
                  />
                </div>
                <form action={deleteTestimonial} className="admin-delete">
                  <input type="hidden" name="id" value={testimonial.id} />
                  <button type="submit">Delete this testimonial</button>
                </form>
              </details>
              <VisibilityToggle
                action={setTestimonialPublished}
                id={testimonial.id}
                published={testimonial.published}
                name={`the testimonial from ${testimonial.name}`}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
