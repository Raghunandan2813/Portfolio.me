"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { experiences } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { fetchBrandLogo } from "@/lib/brand";

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
