import { readEnv } from "./env";

export { GITHUB_PROFILE_URL, GITHUB_USERNAME } from "./site";

/**
 * Calls the GitHub REST API.
 *
 * Unauthenticated requests are limited to 60/hour **per IP**, and serverless
 * functions share egress IPs across many tenants, so in practice that budget is
 * always exhausted. Setting `GITHUB_TOKEN` (a fine-grained token with no scopes
 * is enough for public data) raises the limit to 5,000/hour and is what makes
 * these feeds reliable in production.
 */
export async function githubFetch(path: string): Promise<Response> {
  const token = readEnv("GITHUB_TOKEN");

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

/**
 * Calls the GitHub GraphQL API.
 *
 * Required for contribution totals: the REST events endpoint exposes public
 * activity only, whereas `viewer.contributionsCollection` returns the real
 * calendar including private contributions — but only when the token belongs
 * to the account being queried and carries the `read:user` scope.
 */
export async function githubGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const token = readEnv("GITHUB_TOKEN");
  if (!token) throw new Error("GITHUB_TOKEN is required for the GraphQL API");

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "Raghunandan-Portfolio",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL failed: ${response.status}`);
  }

  const payload = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (payload.errors?.length) {
    // A missing read:user scope surfaces here rather than as a non-200.
    throw new Error(`GitHub GraphQL error: ${payload.errors[0].message}`);
  }
  if (!payload.data) throw new Error("GitHub GraphQL returned no data");

  return payload.data;
}
