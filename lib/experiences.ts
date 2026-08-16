import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { experiences, type ExperienceRow } from "@/db/schema";

/**
 * Shape the experience feed renders. Kept separate from the DB row so the
 * page does not care that `points`/`skills` arrive as jsonb, and so a database
 * outage degrades to an empty section rather than a 500.
 */
export type Experience = {
  id: number;
  company: string;
  role: string;
  monogram: string;
  logo: string | null;
  linkedin: string | null;
  date: string;
  location: string;
  current: boolean;
  description: string | null;
  points: string[];
  skills: string[];
};

function toExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    // Fall back to the first letter so a row without a logo still renders.
    monogram: row.monogram || row.company.charAt(0).toUpperCase(),
    logo: row.logoUrl,
    linkedin: row.linkedinUrl,
    date: row.date,
    location: row.location,
    current: row.current,
    description: row.description,
    points: Array.isArray(row.points) ? row.points : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
  };
}

export async function listExperiences(): Promise<Experience[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(experiences)
      .orderBy(asc(experiences.sortOrder), asc(experiences.id));
    return rows.map(toExperience);
  } catch (error) {
    // The rest of the page is worth serving even if this section cannot load.
    console.error("Failed to load experiences", error);
    return [];
  }
}
