import { cachedJson } from "@/lib/cache";
import { GITHUB_USERNAME, githubFetch } from "@/lib/github";

type GithubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  fork: boolean;
  archived: boolean;
};

type Repo = {
  name: string;
  url: string;
  description: string;
  language: string | null;
  stars: number;
  updatedAt: string;
};

const CACHE_KEY = "github:repos:v1";
const CACHE_TTL_SECONDS = 60 * 60 * 6;

async function fetchRepos(): Promise<Repo[]> {
  const response = await githubFetch(
    `/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=12`,
  );

  return ((await response.json()) as GithubRepo[])
    .filter((repo) => !repo.fork && !repo.archived)
    .slice(0, 4)
    .map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description || "A public project from my GitHub workspace.",
      language: repo.language,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
    }));
}

export async function GET() {
  const result = await cachedJson(CACHE_KEY, CACHE_TTL_SECONDS, fetchRepos);

  if (!result) {
    return Response.json(
      { repos: [], stale: true },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { repos: result.value, stale: !result.fresh },
    {
      headers: {
        // Browser-level caching on top of the D1 cache. `stale-while-revalidate`
        // keeps the feed instant on repeat views.
        "Cache-Control": "public, max-age=600, stale-while-revalidate=86400",
      },
    },
  );
}
