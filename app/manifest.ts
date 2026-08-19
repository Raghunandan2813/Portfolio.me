import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site";

/**
 * Web app manifest.
 *
 * Installability is the smaller half of why this exists. The larger half is
 * that it is the canonical place to declare the site's name, icons and theme
 * colour, and Lighthouse's PWA and best-practices audits look for it — those
 * scores feed the page-experience signals that Search Console reports on.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    // Brand yellow, sampled from the profile photo's disc.
    background_color: "#ffe400",
    theme_color: "#ffe400",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // `maskable` lets Android crop to its own shape without clipping the
      // face; the icon already carries brand colour out to its edges.
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
