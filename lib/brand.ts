import { createClient } from "@supabase/supabase-js";
import { readEnv } from "./env";

/**
 * Finds a company's logo from its own website and stores a copy.
 *
 * Deliberately not LinkedIn: it has no public API for this, scraping breaches
 * its terms, and it blocks datacenter ranges like Vercel's. A company's own
 * site advertises its mark in the markup, which is both permitted and stable.
 *
 * The file is copied into Supabase Storage rather than hot-linked, so the logo
 * cannot vanish when the source rotates its CDN paths, and rather than written
 * to /public, which is read-only at runtime on Vercel.
 */

const BUCKET = "brand-logos";
const MAX_BYTES = 2 * 1024 * 1024;

/** Accepts "snorkel.ai", "https://snorkel.ai/careers", "www.snorkel.ai". */
function normaliseDomain(input: string) {
  let value = input.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "").replace(/^www\./, "");
  value = value.split("/")[0].split("?")[0];
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) throw new Error("Invalid domain");
  return value;
}

function resolve(href: string, base: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/**
 * Candidate marks in preference order: a big touch icon beats a 16px favicon,
 * and both beat an og:image, which is usually a social banner rather than a
 * logo.
 */
function extractCandidates(html: string, base: string) {
  const out: string[] = [];

  const linkTags = html.match(/<link[^>]+>/gi) || [];
  const scored: { href: string; size: number }[] = [];
  for (const tag of linkTags) {
    const rel = tag.match(/rel=["']([^"']+)["']/i)?.[1]?.toLowerCase() || "";
    if (!rel.includes("icon")) continue;
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    const sizes = tag.match(/sizes=["'](\d+)x\d+["']/i)?.[1];
    // Apple touch icons are reliably 180px+ even when unlabelled.
    const size = sizes ? Number(sizes) : rel.includes("apple") ? 180 : 32;
    scored.push({ href, size });
  }
  scored.sort((a, b) => b.size - a.size);
  out.push(...scored.map((item) => item.href));

  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];
  if (og) out.push(og);

  return out.map((href) => resolve(href, base)).filter((url): url is string => Boolean(url));
}

function extensionFor(contentType: string) {
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("x-icon") || contentType.includes("vnd.microsoft")) return "ico";
  return "jpg";
}

function storageClient() {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  // The service-role key bypasses storage policies, so it must never be
  // exposed to the browser. This module is server-only.
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Stores an uploaded image and returns its public URL.
 *
 * Used for testimonial portraits. LinkedIn answers automated requests with
 * HTTP 999, so a profile photo cannot be fetched from its URL the way a
 * company logo can be fetched from a company's own site — it has to be
 * uploaded by hand.
 */
export async function uploadImage(
  file: File,
  prefix: string,
): Promise<{ url: string } | { error: string }> {
  if (!file || file.size === 0) return { error: "No file selected" };
  if (!file.type.startsWith("image/")) return { error: "That is not an image" };
  if (file.size > MAX_BYTES) return { error: "Image must be under 2MB" };

  const storage = storageClient();
  if (!storage) return { error: "SUPABASE_SERVICE_ROLE_KEY is not set" };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const path = `${prefix}-${Date.now()}.${extensionFor(file.type)}`;
  const { error } = await storage.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (error) {
    console.error("Image upload failed", error.message);
    return { error: error.message };
  }

  const { data } = storage.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function fetchBrandLogo(
  input: string,
): Promise<{ url: string; source: string } | null> {
  const domain = normaliseDomain(input);
  const site = `https://${domain}`;

  const page = await fetch(site, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; PortfolioAdmin/1.0)" },
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
  });
  if (!page.ok) throw new Error(`${domain} returned ${page.status}`);

  const html = await page.text();
  const candidates = extractCandidates(html, page.url);
  if (candidates.length === 0) return null;

  for (const candidate of candidates) {
    try {
      const asset = await fetch(candidate, { signal: AbortSignal.timeout(12000) });
      if (!asset.ok) continue;

      const contentType = asset.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) continue;

      const bytes = new Uint8Array(await asset.arrayBuffer());
      if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) continue;

      const storage = storageClient();
      // Without a service-role key there is nowhere to put the file; hand back
      // the source URL so the admin can still see and paste it.
      if (!storage) return { url: candidate, source: `${domain} (not stored)` };

      const path = `${domain}-${Date.now()}.${extensionFor(contentType)}`;
      const { error } = await storage.storage
        .from(BUCKET)
        .upload(path, bytes, { contentType, upsert: true });
      if (error) {
        console.error("Logo upload failed", error.message);
        return { url: candidate, source: `${domain} (not stored)` };
      }

      const { data } = storage.storage.from(BUCKET).getPublicUrl(path);
      return { url: data.publicUrl, source: domain };
    } catch {
      // Try the next candidate rather than failing the whole lookup.
    }
  }

  return null;
}
