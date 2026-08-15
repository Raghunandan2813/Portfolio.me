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
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(here, "..", "public", "og.png");

const INK = "#f8fafc";
const MUTED = "#9fb4c7";
const BLUE = "#0a66c2";
const PURPLE = "#7c3aed";

const h = React.createElement;

function Card() {
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
        backgroundColor: "#08131f",
        backgroundImage: `radial-gradient(circle at 85% 15%, ${BLUE}66, transparent 45%), radial-gradient(circle at 12% 88%, ${PURPLE}55, transparent 45%)`,
        fontFamily: "sans-serif",
      },
    },
    // Header: monogram + handle
    h(
      "div",
      { style: { display: "flex", alignItems: "center" } },
      h(
        "div",
        {
          style: {
            width: "84px",
            height: "84px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "20px",
            backgroundImage: `linear-gradient(140deg, ${BLUE}, ${PURPLE})`,
            color: "#ffffff",
            fontSize: "36px",
            fontWeight: 900,
            letterSpacing: "-2px",
          },
        },
        "RK",
      ),
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
            color: "#8dd1ff",
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
              border: "1px solid #2b4661",
              backgroundColor: "#102438",
              color: "#cee8ff",
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
  let ImageResponse;
  try {
    ({ ImageResponse } = await import("next/og"));
  } catch (error) {
    console.error(
      "Could not load `next/og`. Run `npm run install:ci` first.\n",
      error,
    );
    process.exit(1);
  }

  const response = new ImageResponse(Card(), { width: 1200, height: 630 });
  const buffer = Buffer.from(await response.arrayBuffer());

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);

  console.log(`Wrote ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

await main();
