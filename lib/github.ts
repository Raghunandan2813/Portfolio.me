import { readEnv } from "./env";

export { GITHUB_PROFILE_URL, GITHUB_USERNAME } from "./site";

/**
 * Calls the GitHub REST API.
 *
 * Unauthenticated requests are limited to 60/hour **per IP**, and a Cloudflare
 * Worker shares its egress IPs with many other tenants, so in practice that
 * budget is always exhausted. Setting `GITHUB_TOKEN` (a fine-grained token with
 * no scopes is enough for public data) raises the limit to 5,000/hour and is
 * what makes these feeds reliable in production.
 */
export async function githubFetch(path: string): Promise<Response> {
  const token = await readEnv("GITHUB_TOKEN");

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Raghunandan-Portfolio",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`https://api.github.com${path}`, { headers });

  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const detail =
      response.status === 403 && remaining === "0"
        ? " (rate limit exhausted — set GITHUB_TOKEN)"
        : "";
    throw new Error(`GitHub ${path} failed: ${response.status}${detail}`);
  }

  return response;
}
