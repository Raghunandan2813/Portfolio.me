import type { MetadataRoute } from "next";
import { listProjectSitemapEntries } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";

/**
 * Reads the live project list rather than the bundled array, so hiding a
 * project in the admin also withdraws its URL from the sitemap. Leaving it
 * listed would keep Google crawling a page that now 404s.
 *
 * `lastModified` comes from the row rather than the clock. A sitemap that
 * reports every page as changed on every fetch tells a crawler nothing, and
 * Google's stated response to unreliable lastmod values is to disregard them
 * — which throws away the signal for the pages that really did change.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await listProjectSitemapEntries();

  // The two hub pages genuinely do change whenever any project does. With
  // every project hidden there is nothing to derive a date from, and the epoch
  // the reduce would otherwise return is a worse claim than the truth, so the
  // hubs fall back to now.
  const hubModified = projects.length
    ? projects.reduce<Date>(
        (latest, project) => (project.lastModified > latest ? project.lastModified : latest),
        new Date(0),
      )
    : new Date();

  return [
    { url: absoluteUrl("/"), lastModified: hubModified, changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl("/projects"),
      lastModified: hubModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
