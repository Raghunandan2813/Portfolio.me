import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { cacheEntries } from "@/db/schema";

type CachedRow = { payload: string; freshUntil: number };

async function readEntry(key: string): Promise<CachedRow | null> {
  try {
    const db = await getDb();
    const [row] = await db
      .select({ payload: cacheEntries.payload, freshUntil: cacheEntries.freshUntil })
      .from(cacheEntries)
      .where(eq(cacheEntries.key, key))
      .limit(1);
    return row ?? null;
  } catch (error) {
    console.error(`Cache read failed for "${key}"`, error);
    return null;
  }
}

async function writeEntry(key: string, payload: string, freshUntil: number) {
  try {
    const db = await getDb();
    const now = Date.now();
    await db
      .insert(cacheEntries)
      .values({ key, payload, freshUntil, updatedAt: now })
      .onConflictDoUpdate({
        target: cacheEntries.key,
        set: { payload, freshUntil, updatedAt: now },
      });
  } catch (error) {
    console.error(`Cache write failed for "${key}"`, error);
  }
}

export type CachedResult<T> = {
  value: T;
  /** False when the upstream call failed and a stale entry was served. */
  fresh: boolean;
};

/**
 * Read-through cache with stale-on-error semantics.
 *
 * Order of preference:
 *   1. a fresh cached entry (no upstream call at all)
 *   2. a successful upstream call (cached for `ttlSeconds`)
 *   3. a stale cached entry, when the upstream call fails
 *   4. `null`
 *
 * Step 3 is the important one for GitHub: an expired entry is far more useful
 * than an empty feed when the API rate-limits or has an outage.
 */
export async function cachedJson<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<CachedResult<T> | null> {
  const entry = await readEntry(key);
  const now = Date.now();

  if (entry && entry.freshUntil > now) {
    try {
      return { value: JSON.parse(entry.payload) as T, fresh: true };
    } catch {
      // Corrupt row: fall through and refetch.
    }
  }

  try {
    const value = await fetcher();
    await writeEntry(key, JSON.stringify(value), now + ttlSeconds * 1000);
    return { value, fresh: true };
  } catch (error) {
    console.error(`Upstream fetch failed for "${key}"`, error);
    if (entry) {
      try {
        return { value: JSON.parse(entry.payload) as T, fresh: false };
      } catch {
        return null;
      }
    }
    return null;
  }
}
