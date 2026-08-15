import { sql } from "drizzle-orm";
import {
  bigint,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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
