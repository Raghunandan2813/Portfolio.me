/**
 * Canonical site configuration.
 *
 * `SITE_URL` drives `metadataBase`, canonical links, the sitemap and every
 * absolute Open Graph URL, so it must match the deployed origin exactly —
 * no trailing slash. Override it per environment with `NEXT_PUBLIC_SITE_URL`.
 */
const FALLBACK_SITE_URL = "https://raghunandan-kumar-portfolio.vercel.app";

function normalise(url: string) {
  return url.replace(/\/+$/, "");
}

export const SITE_URL = normalise(
  process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL,
);

export const SITE_NAME = "Raghunandan Kumar";
export const SITE_TITLE = "Raghunandan Kumar | Full Stack & Agentic AI Engineer";
export const SITE_DESCRIPTION =
  "Raghunandan Kumar is a Full Stack and Agentic AI Engineer building production-grade LLM pipelines, RAG systems, multi-agent workflows, and real-time products.";

export const CONTACT_EMAIL = "raghu9555k@gmail.com";
export const LINKEDIN_URL =
  "https://www.linkedin.com/in/raghunandan-kumar-730747253/";

/**
 * Single source of truth for the GitHub handle. Lives here rather than in
 * `lib/github.ts` so client components can import it without pulling in the
 * server-only Worker env helpers.
 */
export const GITHUB_USERNAME = "Raghunandan2813";
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

/** 1200×630 is the size LinkedIn, X, Slack and iMessage all expect. */
export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Raghunandan Kumar — Full Stack & Agentic AI Engineer",
};

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
