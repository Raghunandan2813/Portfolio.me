"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { experiences, projectsTable, testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { fetchBrandLogo, uploadImage } from "@/lib/brand";

/**
 * Mutations for the admin dashboard.
 *
 * Every export calls `requireAdmin()` first. Server actions are POST endpoints
 * that anyone can call directly — the dashboard being behind a redirect proves
 * nothing about who is reaching these.
 */

/** Splits a textarea into trimmed lines, dropping blanks and bullet glyphs. */
function toLines(value: FormDataEntryValue | null): string[] {
  return String(value || "")
    .split("\n")
    .map((line) => line.replace(/^\s*[•*\-–]\s*/, "").trim())
    .filter(Boolean);
}

/** Splits a comma-or-newline separated field, e.g. the tech stack chips. */
function toList(value: FormDataEntryValue | null): string[] {
  return String(value || "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readForm(formData: FormData) {
  const company = String(formData.get("company") || "").trim();
  const role = String(formData.get("role") || "").trim();
  if (!company) throw new Error("Company is required");
  if (!role) throw new Error("Role is required");

  const description = String(formData.get("description") || "").trim();

  return {
    company,
    role,
    monogram: company.charAt(0).toUpperCase(),
    logoUrl: String(formData.get("logoUrl") || "").trim() || null,
    linkedinUrl: String(formData.get("linkedinUrl") || "").trim() || null,
    date: String(formData.get("date") || "").trim(),
    location: String(formData.get("location") || "").trim(),
    current: formData.get("current") === "on",
    description: description || null,
    points: toLines(formData.get("points")),
    skills: toList(formData.get("skills")),
    sortOrder: Number(formData.get("sortOrder") || 0) || 0,
  };
}

export async function createExperience(formData: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.insert(experiences).values(readForm(formData));
  // The home page is statically rendered; without this the new role would not
  // appear until the next deploy.
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateExperience(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Invalid id");

  const db = await getDb();
  await db.update(experiences).set(readForm(formData)).where(eq(experiences.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteExperience(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Invalid id");

  const db = await getDb();
  await db.delete(experiences).where(eq(experiences.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

/* --- Projects ------------------------------------------------------------- */

/** URL-safe slug. Also applied to whatever is typed, so a title can be pasted. */
function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Highlights are entered as one block per line:
 *   Title | Mechanism | Use
 * `Use` is optional, matching the type — a project can ship the mechanism
 * first and gain the rationale later.
 */
function toHighlights(value: FormDataEntryValue | null) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, mechanism, use] = line.split("|").map((part) => part.trim());
      return { title: title || "", mechanism: mechanism || "", use: use || undefined };
    })
    .filter((highlight) => highlight.title);
}

function readProjectForm(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required");

  const rawSlug = String(formData.get("slug") || "").trim();
  const slug = toSlug(rawSlug || title);
  if (!slug) throw new Error("Slug is required");

  const accent = String(formData.get("accent") || "violet");

  return {
    slug,
    title,
    shortTitle: String(formData.get("shortTitle") || "").trim() || title,
    category: String(formData.get("category") || "").trim(),
    tagline: String(formData.get("tagline") || "").trim(),
    summary: String(formData.get("summary") || "").trim(),
    problem: String(formData.get("problem") || "").trim(),
    solution: String(formData.get("solution") || "").trim(),
    highlights: toHighlights(formData.get("highlights")),
    stack: toList(formData.get("stack")),
    liveUrl: String(formData.get("liveUrl") || "").trim() || null,
    githubUrl: String(formData.get("githubUrl") || "").trim(),
    demoVideo: String(formData.get("demoVideo") || "").trim() || null,
    demoPoster: String(formData.get("demoPoster") || "").trim() || null,
    demoLength: String(formData.get("demoLength") || "").trim() || null,
    accent: ["violet", "blue", "orange"].includes(accent) ? accent : "violet",
    sortOrder: Number(formData.get("sortOrder") || 0) || 0,
  };
}

/** Revalidates every route a project appears on. */
function revalidateProject(slug: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
  // A renamed project leaves its old URL cached; clear that too.
  if (previousSlug && previousSlug !== slug) revalidatePath(`/projects/${previousSlug}`);
  revalidatePath("/admin");
}

export async function createProject(formData: FormData) {
  await requireAdmin();
  const values = readProjectForm(formData);
  const db = await getDb();
  await db.insert(projectsTable).values(values);
  revalidateProject(values.slug);
}

export async function updateProject(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Invalid id");

  const values = readProjectForm(formData);
  const db = await getDb();
  // Read the old slug first: changing it changes the public URL, and the stale
  // path needs clearing from the cache.
  const [existing] = await db
    .select({ slug: projectsTable.slug })
    .from(projectsTable)
    .where(eq(projectsTable.id, id))
    .limit(1);

  await db.update(projectsTable).set(values).where(eq(projectsTable.id, id));
  revalidateProject(values.slug, existing?.slug);
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Invalid id");

  const db = await getDb();
  const [existing] = await db
    .select({ slug: projectsTable.slug })
    .from(projectsTable)
    .where(eq(projectsTable.id, id))
    .limit(1);

  await db.delete(projectsTable).where(eq(projectsTable.id, id));
  revalidateProject(existing?.slug ?? "");
}

/* --- Testimonials --------------------------------------------------------- */

function readTestimonialForm(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const quote = String(formData.get("quote") || "").trim();
  if (!name) throw new Error("Name is required");
  if (!quote) throw new Error("Quote is required");

  // Clamped rather than validated-and-rejected: a rating outside 1-5 is a
  // slider bug, not something worth losing the typed quote over.
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") || 5) || 5));

  return {
    name,
    title: String(formData.get("title") || "").trim(),
    company: String(formData.get("company") || "").trim(),
    quote,
    rating,
    photoUrl: String(formData.get("photoUrl") || "").trim() || null,
    linkedinUrl: String(formData.get("linkedinUrl") || "").trim() || null,
    sortOrder: Number(formData.get("sortOrder") || 0) || 0,
  };
}

export async function createTestimonial(formData: FormData) {
  await requireAdmin();
  const db = await getDb();
  await db.insert(testimonials).values(readTestimonialForm(formData));
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateTestimonial(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Invalid id");

  const db = await getDb();
  await db.update(testimonials).set(readTestimonialForm(formData)).where(eq(testimonials.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) throw new Error("Invalid id");

  const db = await getDb();
  await db.delete(testimonials).where(eq(testimonials.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

/**
 * Uploads a portrait and hands back its public URL.
 *
 * Returns a message instead of throwing so a failed upload does not discard
 * the quote the admin has already typed into the neighbouring form.
 */
export async function uploadPhoto(
  _previous: { photoUrl?: string; message?: string } | null,
  formData: FormData,
): Promise<{ photoUrl?: string; message?: string }> {
  await requireAdmin();

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { message: "Choose an image first" };

  const result = await uploadImage(file, "testimonial");
  if ("error" in result) return { message: result.error };
  return { photoUrl: result.url, message: "Uploaded" };
}

/**
 * Looks up a company's logo from its own website and stores it.
 *
 * Returns a message rather than throwing so the form can report a miss without
 * losing what the user has already typed.
 */
export async function lookupLogo(
  _previous: { logoUrl?: string; message?: string } | null,
  formData: FormData,
): Promise<{ logoUrl?: string; message?: string }> {
  await requireAdmin();

  const domain = String(formData.get("domain") || "").trim();
  if (!domain) return { message: "Enter a company domain, e.g. snorkel.ai" };

  try {
    const result = await fetchBrandLogo(domain);
    if (!result) return { message: `No logo found on ${domain}` };
    return { logoUrl: result.url, message: `Found via ${result.source}` };
  } catch (error) {
    console.error("Logo lookup failed", error);
    return { message: "Lookup failed. Paste a logo URL instead." };
  }
}
