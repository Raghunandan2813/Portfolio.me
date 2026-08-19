/**
 * Generates `public/og.png`, the 1200x630 social preview card.
 *
 * This runs in Node at authoring time, NOT in the Worker at request time. The
 * satori + resvg WASM that `next/og` pulls in is well over a megabyte, which is
 * a meaningful share of the Worker size budget; rendering once and committing
 * the PNG keeps the deployed bundle unaffected.
 *
 * Usage: npm run og:generate   (re-run whenever the headline copy changes)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");
const outputPath = resolve(publicDir, "og.png");

/**
 * Palette taken from the site's dark theme. The card previously used a blue
 * and violet scheme that appears nowhere on the site, so a shared link looked
 * like it belonged to a different project.
 */
const INK = "#f4f4f4";
const MUTED = "#a3a3a3";
const AMBER = "#ffd400";
const AMBER_DEEP = "#ff8c00";
const BRAND = "#ffe400";

/**
 * The face, cut to a circle and embedded as a data URI.
 *
 * A photo outperforms a monogram in a link preview for the same reason it does
 * in a tab: the card is competing for attention in a feed, and a face is what
 * a person stops on. It is also the same image search associates with the
 * Person entity, which reinforces rather than splits the signal.
 */
async function facePng(size) {
  const disc = Buffer.from(
    `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">` +
      `<circle cx="512" cy="512" r="500" fill="#fff"/></svg>`,
  );
  const flattened = await sharp(await readFile(resolve(publicDir, "profile.jpeg")))
    .composite([{ input: disc, blend: "dest-in" }])
    .flatten({ background: BRAND })
    .png()
    .toBuffer();

  const circle = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
      `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );
  const cropped = await sharp(flattened)
    .extract({ left: 120, top: 70, width: 740, height: 740 })
    .resize(size, size, { fit: "cover", kernel: "lanczos3" })
    .png()
    .toBuffer();

  const masked = await sharp(cropped)
    .composite([{ input: circle, blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  return `data:image/png;base64,${masked.toString("base64")}`;
}

const h = React.createElement;

function Card(faceSrc) {
  return h(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        backgroundColor: "#0a0a0a",
        backgroundImage: `radial-gradient(circle at 88% 12%, ${AMBER}2e, transparent 46%), radial-gradient(circle at 10% 92%, ${AMBER_DEEP}2a, transparent 44%)`,
        fontFamily: "sans-serif",
      },
    },
    // Header: monogram + handle
    h(
      "div",
      { style: { display: "flex", alignItems: "center" } },
      h("img", {
        src: faceSrc,
        width: 96,
        height: 96,
        style: { borderRadius: "50%" },
      }),
      h(
        "div",
        {
          style: {
            marginLeft: "24px",
            color: MUTED,
            fontSize: "24px",
            letterSpacing: "4px",
          },
        },
        "BUILD / LEARN / SHIP",
      ),
    ),
    // Body: name + headline
    h(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      h(
        "div",
        {
          style: {
            color: INK,
            fontSize: "82px",
            fontWeight: 800,
            letterSpacing: "-3px",
            lineHeight: 1.05,
          },
        },
        "Raghunandan Kumar",
      ),
      h(
        "div",
        {
          style: {
            marginTop: "20px",
            color: AMBER,
            fontSize: "38px",
            fontWeight: 700,
            letterSpacing: "-1px",
          },
        },
        "Full Stack & Agentic AI Engineer",
      ),
      h(
        "div",
        {
          style: {
            marginTop: "20px",
            maxWidth: "900px",
            color: MUTED,
            fontSize: "27px",
            lineHeight: 1.45,
          },
        },
        "Production-grade LLM pipelines, RAG systems, multi-agent workflows, and real-time products.",
      ),
    ),
    // Footer: stack chips
    h(
      "div",
      { style: { display: "flex", alignItems: "center" } },
      ...["Next.js", "TypeScript", "LangGraph", "RAG", "PostgreSQL"].map((label) =>
        h(
          "div",
          {
            key: label,
            style: {
              display: "flex",
              marginRight: "14px",
              padding: "12px 22px",
              borderRadius: "999px",
              border: "1px solid #333333",
              backgroundColor: "#151515",
              color: "#e5e5e5",
              fontSize: "23px",
            },
          },
          label,
        ),
      ),
    ),
  );
}

async function main() {
  // This Next build's package.json `exports` map has no "./og" entry, so the
  // bare specifier fails under plain Node resolution even though the module is
  // present. Fall back to the concrete file path.
  let ImageResponse;
  for (const specifier of ["next/og", "next/og.js"]) {
    try {
      ({ ImageResponse } = await import(specifier));
      if (ImageResponse) break;
    } catch {
      // Try the next specifier.
    }
  }

  if (!ImageResponse) {
    console.error(
      "Could not load ImageResponse from next/og or next/og.js. Run `npm ci` first.",
    );
    process.exit(1);
  }

  const response = new ImageResponse(Card(await facePng(192)), {
    width: 1200,
    height: 630,
  });
  const buffer = Buffer.from(await response.arrayBuffer());

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);

  console.log(`Wrote ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

await main();
