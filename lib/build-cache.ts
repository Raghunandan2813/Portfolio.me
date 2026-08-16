/**
 * Memoises content reads for the duration of a production build.
 *
 * `next build` renders every page concurrently inside a worker process, and
 * each page repeats the same queries — the home page alone asks for
 * experiences, projects and testimonials, and each case-study page asks for the
 * project list again. Fifteen pages produced roughly thirty round trips through
 * one shared connection pool, and rendering stalled past Next's 60s per-page
 * limit.
 *
 * Memoising by key collapses that to one query per table per worker. The cache
 * is deliberately build-only: at runtime a long-lived serverless instance would
 * otherwise serve the first response it ever read, and edits from /admin would
 * never appear. Runtime freshness is handled by `revalidatePath`.
 */
const inFlight = new Map<string, Promise<unknown>>();

function isBuild() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function buildCached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!isBuild()) return load();

  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  // Stored before awaiting so concurrent renders share one query rather than
  // each starting their own.
  const promise = load();
  inFlight.set(key, promise);
  return promise;
}
