import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { listExperiences } from "@/lib/experiences";
import { createExperience, deleteExperience, updateExperience } from "./actions";
import { ExperienceForm } from "./ExperienceForm";
import { SignOut } from "./SignOut";

export const metadata: Metadata = { robots: { index: false, follow: false } };
// Always reflect the current table, never a cached copy.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  const roles = await listExperiences();

  return (
    <main className="admin-shell">
      <header className="admin-head">
        <div>
          <span className="eyebrow">Portfolio admin</span>
          <h1>Experience</h1>
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
    </main>
  );
}
