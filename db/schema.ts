import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Roles shown in the experience feed.
 *
 * Previously a hardcoded array in `app/page.tsx`; moved here so entries can be
 * added from the admin dashboard without a redeploy.
 *
 * `points` and `skills` are jsonb string arrays rather than separate tables:
 * they are always read and written whole, never queried across rows, so
 * normalising them would add joins and buy nothing.
 *
 * `sortOrder` is explicit rather than ordering by date, because the dates are
 * free text ("July 2026 - Present") and two current roles have no meaningful
 * chronological order between them.
 */
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  /** Fallback initial, used when no logo has been fetched. */
  monogram: text("monogram").notNull().default(""),
  /** Public URL in Supabase Storage. Null renders the monogram instead. */
  logoUrl: text("logo_url"),
  /** Company page. Null renders the company name as plain text. */
  linkedinUrl: text("linkedin_url"),
  /** Free text, e.g. "July 2026 - Present". */
  date: text("date").notNull(),
  location: text("location").notNull().default(""),
  current: boolean("current").notNull().default(false),
  /** Optional single-paragraph summary. */
  description: text("description"),
  points: jsonb("points").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  skills: jsonb("skills").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type ExperienceRow = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;

/**
 * Case-study projects, previously the `projects` array in app/data/portfolio.ts.
 *
 * `slug` is unique because it addresses /projects/[slug]; changing it changes
 * the public URL, so the admin form warns rather than silently breaking links.
 *
 * `highlights` is jsonb for the same reason as `points` above: always read and
 * written whole, never queried across rows.
 */
export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  shortTitle: text("short_title").notNull().default(""),
  category: text("category").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  summary: text("summary").notNull().default(""),
  problem: text("problem").notNull().default(""),
  solution: text("solution").notNull().default(""),
  highlights: jsonb("highlights")
    .$type<{ title: string; mechanism: string; use?: string }[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  stack: jsonb("stack").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  /** Null hides the "Open live product" call to action. */
  liveUrl: text("live_url"),
  githubUrl: text("github_url").notNull().default(""),
  /** Path under /public, e.g. "/videos/mindly-demo.mp4". Null hides the player. */
  demoVideo: text("demo_video"),
  demoPoster: text("demo_poster"),
  demoLength: text("demo_length"),
  /** Drives the card's colour treatment: violet | blue | orange. */
  accent: text("accent").notNull().default("violet"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type ProjectRow = typeof projectsTable.$inferSelect;

/**
 * Recommendations shown in the testimonials feed.
 *
 * `rating` is stored 1-5 and clamped on write. It is nullable-by-default of 5
 * rather than optional because a recommendation without a rating renders an
 * empty star row, which reads as zero rather than as "not given".
 *
 * `photoUrl` is a Supabase Storage URL. LinkedIn profile photos cannot be
 * fetched programmatically — linkedin.com answers automated requests with
 * HTTP 999 — so the image is uploaded through the admin form instead.
 */
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  /** Job title, e.g. "Founder". */
  title: text("title").notNull().default(""),
  company: text("company").notNull().default(""),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  photoUrl: text("photo_url"),
  linkedinUrl: text("linkedin_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type TestimonialRow = typeof testimonials.$inferSelect;

export const siteStats = pgTable("site_stats", {
  id: text("id").primaryKey(),
  totalViews: integer("total_views").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Fixed-window rate limit counters. `key` encodes both the bucket and the
 * window (e.g. `contact:1.2.3.4:29174`) so an expired window is simply a row
 * nobody reads again; `expiresAt` exists so those rows can be swept.
 *
 * Epoch milliseconds exceed the range of a 32-bit int, so these are bigint.
 * `mode: "number"` keeps them as JS numbers, which is safe below 2^53.
 */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
});

/**
 * Response cache for third-party APIs (currently GitHub). Stale rows are kept
 * rather than deleted so a failing upstream can still be served from cache.
 */
export const cacheEntries = pgTable("cache_entries", {
  key: text("key").primaryKey(),
  payload: text("payload").notNull(),
  freshUntil: bigint("fresh_until", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
