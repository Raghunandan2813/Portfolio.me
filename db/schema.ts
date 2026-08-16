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
