/**
 * One-off seed: copies the three roles that used to live in `app/page.tsx`
 * into the `experiences` table. Safe to re-run — it skips any company that
 * already has a row, so it will not duplicate after the admin UI is in use.
 *
 *   node scripts/seed-experiences.mjs
 */
import { readFileSync } from "node:fs";
import postgres from "postgres";

// drizzle-kit reads .env itself; this script is plain node, so parse it here.
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!match) continue;
  const value = match[2].replace(/^['"]|['"]$/g, "");
  if (!process.env[match[1]]) process.env[match[1]] = value;
}

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DIRECT_URL or DATABASE_URL required");

const sql = postgres(url, { prepare: false, max: 1 });

const rows = [
  {
    company: "Snorkel AI",
    role: "AI Expert",
    monogram: "S",
    logo_url: "/logos/snorkel-ai.png",
    linkedin_url: "https://www.linkedin.com/company/snorkel-ai/",
    date: "July 2026 - Present",
    location: "Remote",
    current: true,
    description: null,
    points: [
      "Rebuilt 7+ returned tasks from real merged open-source PRs across Python, TypeScript and Rust repos, taking each through a multi-stage automated review gate to acceptance.",
      "Runs oracle, base, forgery and idempotence scenarios directly from the packed submission zip, reproducing the grading platform's real environment. Caught defects that the automated gates scored as passing.",
      "An agent could score a perfect 1.0 by printing the graded test IDs without running a single test. Fixed with per-run secret tokens injected into test names at verify time, making the pass signal impossible to fake.",
      "The oracle solution was missing 13 of the PR's own test files, leaving repository tests failing while the reward still showed 1.0. Traced it to one root cause and restored full PR integrity with an automated audit.",
      "Reviewed other contributors' tasks and proved each finding in a container — including using git forensics (loose objects, missing remote, commit metadata) to show a shipped repo was a fresh git init with a fabricated base commit SHA.",
    ],
    skills: [
      "Python", "TypeScript", "Rust", "Docker", "Git internals", "Bash",
      "PowerShell", "pytest", "Jest", "Cargo", "pnpm/uv", "JSON/TOML config",
      "CI log debugging", "LLM-as-judge evaluation",
    ],
    sort_order: 0,
  },
  {
    company: "Outlier",
    role: "AI Engineer and Trainer",
    monogram: "O",
    logo_url: "/logos/outlier.svg",
    linkedin_url: "https://www.linkedin.com/company/try-outlier/",
    date: "June 2026 - Present",
    location: "Remote · San Francisco, USA",
    current: true,
    description: null,
    points: [
      "Evaluated and rated outputs from large language models (LLMs) based on quality, accuracy, and safety guidelines.",
      "Trained AI models through structured feedback, improving reasoning, coherence, and response quality.",
      "Performed data annotation and labelling to support AI model training and fine-tuning datasets.",
      "Wrote and tested prompts to assess model behaviour and edge-case handling across scenarios.",
    ],
    skills: [
      "Large Language Models (LLMs)", "Human-in-the-Loop AI Training", "Prompt Engineering",
      "Model Evaluation", "Data Annotation and Labeling", "Fine-Tuning Dataset Preparation",
      "AI Safety Alignment", "Response Quality Assessment", "Edge-Case Testing",
    ],
    sort_order: 1,
  },
  {
    company: "TurboML",
    role: "Software Engineering Intern (AI)",
    monogram: "T",
    logo_url: "/logos/turboml.png",
    linkedin_url: null,
    date: "April 2025 - May 2026",
    location: "Remote · California, USA",
    current: false,
    description: null,
    points: [
      "Engineered a Redis-backed scheduling engine using Sorted Sets and a purpose-built daemon, achieving sub-second reminder execution for workflows limited to a 24-hour window.",
      "Unified Swiggy food delivery and dining, Blinkit grocery services, and Google APIs within an AI-agent tool layer that supports contextual tool selection and user-driven routing.",
      "Developed a WhatsApp Business bot control interface with /help, /reset, and /new commands, while enabling environment-based runtime configuration to simplify deployment and initialization.",
      "Enhanced the WhatsApp agent pipeline with Azure Blob Storage–based file handling and support for managing message reactions.",
    ],
    skills: [
      "Redis (Sorted Sets)", "WhatsApp Business API", "Azure Blob Storage", "Google APIs",
      "Swiggy and Blinkit APIs", "RESTful APIs", "Agentic AI Tool Calling",
      "Background Daemons", "Environment-Based Configuration",
    ],
    sort_order: 2,
  },
];

let inserted = 0;
for (const row of rows) {
  const existing = await sql`select id from experiences where company = ${row.company}`;
  if (existing.length > 0) {
    console.log(`skip   ${row.company} (already present)`);
    continue;
  }
  await sql`
    insert into experiences
      (company, role, monogram, logo_url, linkedin_url, date, location, current, description, points, skills, sort_order)
    values
      (${row.company}, ${row.role}, ${row.monogram}, ${row.logo_url}, ${row.linkedin_url},
       ${row.date}, ${row.location}, ${row.current}, ${row.description},
       ${JSON.stringify(row.points)}::jsonb, ${JSON.stringify(row.skills)}::jsonb, ${row.sort_order})
  `;
  console.log(`insert ${row.company}`);
  inserted += 1;
}

const [{ count }] = await sql`select count(*)::int as count from experiences`;
console.log(`\ninserted ${inserted}; experiences table now holds ${count} rows`);
await sql.end();
