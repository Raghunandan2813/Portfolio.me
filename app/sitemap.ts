import type { MetadataRoute } from "next";
import { listProjects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";

/**
 * Reads the live project list rather than the bundled array, so hiding a
 * project in the admin also withdraws its URL from the sitemap. Leaving it
 * listed would keep Google crawling a page that now 404s.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const projects = await listProjects();

  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/projects"), lastModified, changeFrequency: "monthly", priority: 0.8 },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
