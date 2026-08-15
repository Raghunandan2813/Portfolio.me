import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations run from your machine, so the direct connection (port 5432)
    // is fine and avoids PgBouncer's restrictions on DDL. Falls back to
    // DATABASE_URL when a separate direct URL is not configured.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
