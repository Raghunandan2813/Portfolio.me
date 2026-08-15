/**
 * Reads a configuration value from the environment.
 *
 * On Vercel every var and secret is exposed through `process.env`, so this is a
 * thin wrapper that normalises empty strings to `undefined`.
 */
export function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

/**
 * Best-effort client IP.
 *
 * Vercel terminates TLS at its edge and sets `x-forwarded-for`, whose first
 * entry is the original client. `request.ip` is not available in route
 * handlers, so the header is the supported path.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
