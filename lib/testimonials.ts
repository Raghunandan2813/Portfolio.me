import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { testimonials, type TestimonialRow } from "@/db/schema";
import { buildCached } from "./build-cache";

export type Testimonial = {
  id: number;
  name: string;
  title: string;
  company: string;
  quote: string;
  rating: number;
  photo: string | null;
  linkedin: string | null;
  /** "BY" for Bhaskar Yadav — shown when there is no photo. */
  initials: string;
};

/** Up to two letters, so the avatar stays legible at 46px. */
export function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function toTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    company: row.company,
    quote: row.quote,
    // Clamp on read as well as write: a row edited directly in the Supabase
    // table editor would otherwise render a broken star row.
    rating: Math.min(5, Math.max(0, row.rating)),
    photo: row.photoUrl,
    linkedin: row.linkedinUrl,
    initials: initialsFor(row.name),
  };
}

/** Raw rows for the admin list, including the id the forms need. */
export async function listTestimonialRows(): Promise<TestimonialRow[]> {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(testimonials)
      .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
  } catch (error) {
    console.error("Failed to load testimonial rows", error);
    return [];
  }
}

export async function listTestimonials(): Promise<Testimonial[]> {
  return buildCached("testimonials", async () => {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(testimonials)
      .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
    return rows.map(toTestimonial);
  } catch (error) {
    // The placeholder card renders instead, which is what the section showed
    // before any testimonial existed.
    console.error("Failed to load testimonials", error);
    return [];
  }
  });
}
