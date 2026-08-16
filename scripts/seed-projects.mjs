/**
 * One-off seed: copies the projects that used to live in
 * `app/data/portfolio.ts` into the `projects` table.
 *
 * Reads the TypeScript source directly rather than duplicating the content
 * here, so there is no chance of the two drifting. Safe to re-run: it skips
 * any slug already present.
 *
 *   node scripts/seed-projects.mjs
 */
import { readFileSync } from "node:fs";
import postgres from "postgres";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!match) continue;
  const value = match[2].replace(/^['"]|['"]$/g, "");
  if (!process.env[match[1]]) process.env[match[1]] = value;
}

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DIRECT_URL or DATABASE_URL required");

// Strip the type annotations so the array can be evaluated as plain JS.
const source = readFileSync("app/data/portfolio.ts", "utf8");
const start = source.indexOf("export const projects");
// Seek past the `=` first: the declaration reads `projects: Project[] = [`, so
// the first `[` after the name belongs to the type annotation, not the array.
const assign = source.indexOf("=", start);
const arrayStart = source.indexOf("[", assign);
let depth = 0;
let end = arrayStart;
for (let i = arrayStart; i < source.length; i += 1) {
  if (source[i] === "[") depth += 1;
  if (source[i] === "]") {
    depth -= 1;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
const literal = source.slice(arrayStart, end);
const projects = (0, eval)(`(${literal})`);
console.log(`parsed ${projects.length} projects from app/data/portfolio.ts`);

const sql = postgres(url, { prepare: false, max: 1 });

let inserted = 0;
for (const [index, project] of projects.entries()) {
  const existing = await sql`select id from projects where slug = ${project.slug}`;
  if (existing.length > 0) {
    console.log(`skip   ${project.slug} (already present)`);
    continue;
  }
  await sql`
    insert into projects
      (slug, title, short_title, category, tagline, summary, problem, solution,
       highlights, stack, live_url, github_url, demo_video, demo_poster, demo_length,
       accent, sort_order)
    values
      (${project.slug}, ${project.title}, ${project.shortTitle ?? ""}, ${project.category ?? ""},
       ${project.tagline ?? ""}, ${project.summary ?? ""}, ${project.problem ?? ""},
       ${project.solution ?? ""}, ${JSON.stringify(project.highlights ?? [])}::jsonb,
       ${JSON.stringify(project.stack ?? [])}::jsonb, ${project.liveUrl ?? null},
       ${project.githubUrl ?? ""}, ${project.demoVideo ?? null}, ${project.demoPoster ?? null},
       ${project.demoLength ?? null}, ${project.accent ?? "violet"}, ${index})
  `;
  console.log(`insert ${project.slug} (${project.highlights?.length ?? 0} highlights)`);
  inserted += 1;
}

const [{ count }] = await sql`select count(*)::int as count from projects`;
console.log(`\ninserted ${inserted}; projects table now holds ${count} rows`);
await sql.end();
