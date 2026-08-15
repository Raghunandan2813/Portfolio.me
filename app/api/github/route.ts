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

export async function GET() {
  try {
    const response = await fetch(
      "https://api.github.com/users/Raghunandan2813/repos?sort=updated&direction=desc&per_page=12",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "Raghunandan-Portfolio",
        },
      },
    );

    if (!response.ok) throw new Error("GitHub request failed");
    const repos = ((await response.json()) as GithubRepo[])
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

    return Response.json(
      { repos },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
    );
  } catch {
    return Response.json({ repos: [] }, { status: 503 });
  }
}
