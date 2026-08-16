/**
 * Seeds the first testimonial. Safe to re-run — skips names already present.
 *
 *   node scripts/seed-testimonials.mjs
 */
import { readFileSync } from "node:fs";
import postgres from "postgres";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
}

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DIRECT_URL or DATABASE_URL required");
const sql = postgres(url, { prepare: false, max: 1 });

const rows = [
  {
    name: "Bhaskar Yadav",
    title: "",
    company: "",
    quote:
      "Working with Raghunandan Kumar was a great experience. He built a customized AI-agent automation system that streamlined our operations through intelligent reminders, WhatsApp integration, and multiple third-party services. He understood our requirements clearly, communicated consistently, and delivered a reliable solution that was easy to use. His expertise in AI agents, API integrations, and backend automation was impressive. I highly recommend him to anyone looking for a skilled and dependable AI automation developer.",
    rating: 5,
    // LinkedIn blocks automated requests (HTTP 999), so the photo cannot be
    // fetched from the profile. Upload it through /admin; until then the
    // initials avatar renders.
    photo_url: null,
    linkedin_url: "https://www.linkedin.com/in/bhashkaryadav/",
    sort_order: 0,
  },
];

let inserted = 0;
for (const row of rows) {
  const existing = await sql`select id from testimonials where name = ${row.name}`;
  if (existing.length > 0) {
    console.log(`skip   ${row.name} (already present)`);
    continue;
  }
  await sql`
    insert into testimonials
      (name, title, company, quote, rating, photo_url, linkedin_url, sort_order)
    values
      (${row.name}, ${row.title}, ${row.company}, ${row.quote}, ${row.rating},
       ${row.photo_url}, ${row.linkedin_url}, ${row.sort_order})
  `;
  console.log(`insert ${row.name} (${row.rating} stars)`);
  inserted += 1;
}

const [{ count }] = await sql`select count(*)::int as count from testimonials`;
console.log(`\ninserted ${inserted}; testimonials table now holds ${count} rows`);
await sql.end();
