import { lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { rateLimits } from "@/db/schema";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type RateLimitOptions = {
  /** Namespace for the counter, e.g. "contact". */
  bucket: string;
  /** Caller identity, normally the client IP. */
  identifier: string;
  /** Requests permitted per window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
};

/**
 * Fixed-window rate limiter backed by D1.
 *
 * Fails **open**: if the database is unreachable the request is allowed
 * through. A contact form that silently rejects a real enquiry during a D1
 * incident is a worse outcome than letting spam past, and the caller still
 * validates and persists defensively.
 */
export async function checkRateLimit({
  bucket,
  identifier,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowIndex = Math.floor(now / windowMs);
  const expiresAt = (windowIndex + 1) * windowMs;
  const key = `${bucket}:${identifier}:${windowIndex}`;

  try {
    const db = await getDb();

    // INSERT ... ON CONFLICT DO UPDATE ... RETURNING is a single atomic
    // statement, so concurrent requests cannot both read a stale count.
    const [row] = await db
      .insert(rateLimits)
      .values({ key, count: 1, expiresAt })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: { count: sql`${rateLimits.count} + 1` },
      })
      .returning({ count: rateLimits.count });

    const count = row?.count ?? 1;

    // Opportunistic sweep so expired windows do not accumulate forever.
    if (Math.random() < 0.05) {
      await db.delete(rateLimits).where(lt(rateLimits.expiresAt, now));
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: Math.max(1, Math.ceil((expiresAt - now) / 1000)),
    };
  } catch (error) {
    console.error(`Rate limit check failed for bucket "${bucket}"`, error);
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

/** Standard 429 response with a Retry-After header. */
export function tooManyRequests(result: RateLimitResult, message: string) {
  return Response.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
        "Cache-Control": "no-store",
      },
    },
  );
}
