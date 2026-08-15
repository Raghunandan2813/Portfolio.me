import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const siteStats = sqliteTable("site_stats", {
  id: text("id").primaryKey(),
  totalViews: integer("total_views").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Fixed-window rate limit counters. `key` encodes both the bucket and the
 * window (e.g. `contact:1.2.3.4:29174`) so an expired window is simply a row
 * nobody reads again; `expiresAt` exists so those rows can be swept.
 */
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  expiresAt: integer("expires_at").notNull(),
});

/**
 * Response cache for third-party APIs (currently GitHub). Stale rows are kept
 * rather than deleted so a failing upstream can still be served from cache.
 */
export const cacheEntries = sqliteTable("cache_entries", {
  key: text("key").primaryKey(),
  payload: text("payload").notNull(),
  freshUntil: integer("fresh_until").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
