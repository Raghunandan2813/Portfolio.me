import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Supabase Postgres connection for a serverless deployment.
 *
 * Two things matter here and both are easy to get wrong on Vercel:
 *
 * 1. **Use the transaction pooler**, not the direct connection. Each serverless
 *    invocation can open its own connection, and Postgres' connection limit is
 *    reached almost immediately under real traffic. The pooler URL is the one
 *    on port 6543 (Supabase dashboard -> Connect -> Transaction pooler).
 *
 * 2. **`prepare: false` is mandatory** with the transaction pooler. PgBouncer
 *    in transaction mode does not support prepared statements, and postgres-js
 *    uses them by default. Without this you get sporadic
 *    "prepared statement ... already exists" errors under concurrency.
 */
declare global {
  // Reused across hot reloads in development and warm invocations in
  // production, so we do not open a new pool on every request.
  // eslint-disable-next-line no-var
  var __portfolioDb: ReturnType<typeof createDb> | undefined;
}

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and paste your " +
        "Supabase transaction-pooler connection string (port 6543).",
    );
  }

  const client = postgres(connectionString, {
    // Required for PgBouncer transaction mode.
    prepare: false,
    // One connection per serverless instance; the pooler does the real pooling.
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client, { schema });
}

/**
 * Async purely to preserve the previous `await getDb()` call sites from the
 * Cloudflare D1 implementation.
 */
export async function getDb() {
  if (!globalThis.__portfolioDb) {
    globalThis.__portfolioDb = createDb();
  }
  return globalThis.__portfolioDb;
}
