/**
 * Reads a configuration value.
 *
 * Wrangler exposes plain `vars` on `process.env` under `nodejs_compat`, but
 * secrets are only reliably present on the Worker env object. Checking both
 * keeps local `.env` development and deployed secrets on the same code path.
 */
export async function readEnv(name: string): Promise<string | undefined> {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;

  try {
    const { env } = await import("cloudflare:workers");
    const value = (env as unknown as Record<string, unknown>)[name];
    return typeof value === "string" && value.length > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Best-effort client IP. Cloudflare always sets `cf-connecting-ip`; the other
 * headers only matter for local development and proxies in front of the Worker.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    forwarded?.split(",")[0]?.trim() ||
    "unknown"
  );
}
