"use client";

import { useEffect, useState } from "react";

type Repo = {
  name: string;
  url: string;
  description: string;
  language: string | null;
  stars: number;
  updatedAt: string;
};

const fallbackRepos: Repo[] = [
  {
    name: "Mindly-Ai-Agent",
    url: "https://github.com/Raghunandan2813/Mindly-Ai-Agent",
    description: "Persistent memory agent with semantic retrieval and knowledge graphs.",
    language: "TypeScript",
    stars: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    name: "ai-interview-coach",
    url: "https://github.com/Raghunandan2813/ai-interview-coach",
    description: "Real-time voice interview practice with structured AI feedback.",
    language: "TypeScript",
    stars: 0,
    updatedAt: new Date().toISOString(),
  },
];

function relativeDate(date: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000));
  if (days === 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 30) return `Updated ${days} days ago`;
  return `Updated ${new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(date))}`;
}

export function GithubProjects() {
  const [repos, setRepos] = useState<Repo[]>(fallbackRepos);

  useEffect(() => {
    fetch("/api/github")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { repos: Repo[] }) => {
        if (data.repos?.length) setRepos(data.repos);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="github-repos" aria-label="Latest GitHub repositories">
      {repos.map((repo) => (
        <a key={repo.name} href={repo.url} target="_blank" rel="noreferrer">
          <span className="repo-status">{relativeDate(repo.updatedAt)}</span>
          <strong>{repo.name}</strong>
          <p>{repo.description}</p>
          <div>
            <span>{repo.language || "Code"}</span>
            <span>★ {repo.stars}</span>
            <span aria-hidden="true">↗</span>
          </div>
        </a>
      ))}
    </div>
  );
}
