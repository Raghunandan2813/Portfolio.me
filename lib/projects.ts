import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projectsTable, type ProjectRow } from "@/db/schema";
import { buildCached } from "./build-cache";
import type { Project } from "@/app/data/portfolio";
import { projects as fallbackProjects } from "@/app/data/portfolio";

/**
 * Projects, read from Postgres.
 *
 * The `Project` shape is reused verbatim from app/data/portfolio.ts so every
 * existing component keeps working untouched; only the source of the data
 * changed.
 *
 * If the database is unreachable the hardcoded array is served instead. For
 * experiences an empty section is an acceptable degradation, but the project
 * pages are the substance of the portfolio — blanking them would be worse than
 * showing content that is merely out of date.
 */

/**
 * Stand-in timestamp for the bundled projects, used only when the database is
 * unreachable. Fixed rather than `new Date()` so a string of failed reads does
 * not advertise a fresh edit on every crawl.
 */
const BUNDLED_AT = new Date("2026-08-01T00:00:00Z");

function toProject(row: ProjectRow): Project {
  return {
    slug: row.slug,
    title: row.title,
    shortTitle: row.shortTitle || row.title,
    category: row.category,
    tagline: row.tagline,
    summary: row.summary,
    problem: row.problem,
    solution: row.solution,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    stack: Array.isArray(row.stack) ? row.stack : [],
    liveUrl: row.liveUrl,
    githubUrl: row.githubUrl,
    demoVideo: row.demoVideo,
    demoPoster: row.demoPoster,
    demoLength: row.demoLength ?? undefined,
    accent: (row.accent as Project["accent"]) || "violet",
  };
}

export async function listProjects(): Promise<Project[]> {
  return buildCached("projects", async () => {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(projectsTable)
      .orderBy(asc(projectsTable.sortOrder), asc(projectsTable.id));
    // An empty table on a fresh database should not blank the site.
    //
    // Emptiness is judged before the `published` filter, deliberately: hiding
    // every project is a choice, and falling back to the bundled array there
    // would resurrect exactly the projects that were just hidden.
    if (rows.length === 0) return fallbackProjects;
    return rows.filter((row) => row.published).map(toProject);
  } catch (error) {
    console.error("Failed to load projects, serving bundled copy", error);
    return fallbackProjects;
  }
  });
}

export async function getProject(slug: string): Promise<Project | null> {
  // During a build the full list is already memoised, so resolve from it rather
  // than issuing another query for every slug. At runtime the single-row query
  // below is cheaper than fetching every project to discard all but one.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    const all = await listProjects();
    return all.find((project) => project.slug === slug) ?? null;
  }

  try {
    const db = await getDb();
    const [row] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.slug, slug))
      .limit(1);
    // A hidden project 404s rather than falling through to the bundled copy:
    // hiding has to hide the case-study page too, or the row is off the feed
    // while its URL stays live and indexed.
    if (row) return row.published ? toProject(row) : null;
  } catch (error) {
    console.error("Failed to load project, falling back", error);
  }
  return fallbackProjects.find((project) => project.slug === slug) ?? null;
}

/**
 * Slugs and their timestamps, for the sitemap.
 *
 * Selected separately from `listProjects()` because the `Project` shape is what
 * the pages render and carries no timestamp. Stamping every URL with the
 * current time instead — which is what the sitemap did — is the pattern Google
 * treats as noise and then ignores, so a genuinely updated page stops being
 * distinguishable from an untouched one.
 */
export async function listProjectSitemapEntries(): Promise<
  { slug: string; lastModified: Date }[]
> {
  try {
    const db = await getDb();
    const rows = await db
      .select({
        slug: projectsTable.slug,
        published: projectsTable.published,
        createdAt: projectsTable.createdAt,
      })
      .from(projectsTable)
      .orderBy(asc(projectsTable.sortOrder), asc(projectsTable.id));

    if (rows.length === 0) {
      return fallbackProjects.map((project) => ({
        slug: project.slug,
        lastModified: BUNDLED_AT,
      }));
    }

    return rows
      .filter((row) => row.published)
      .map((row) => ({ slug: row.slug, lastModified: row.createdAt }));
  } catch (error) {
    console.error("Failed to load sitemap entries", error);
    return fallbackProjects.map((project) => ({ slug: project.slug, lastModified: BUNDLED_AT }));
  }
}

/** Rows for the admin list, including the id the forms need. */
export async function listProjectRows(): Promise<ProjectRow[]> {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(projectsTable)
      .orderBy(asc(projectsTable.sortOrder), asc(projectsTable.id));
  } catch (error) {
    console.error("Failed to load project rows", error);
    return [];
  }
}
