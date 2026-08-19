/**
 * Generates the favicon and app icons from `public/profile.jpeg`.
 *
 * The site used to ship an "RK" monogram SVG in indigo and violet — colours
 * that appear nowhere else on the site. A photo is both on-brand and the
 * stronger signal in a tab strip or a bookmark list: a face is recognised
 * faster than two letters at 16px.
 *
 * Runs at authoring time, not at request time, and the PNGs are committed.
 * Re-run after changing the photo:  npm run icons:generate
 */
import { readFile, writeFile, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");
const source = resolve(publicDir, "profile.jpeg");

/** Brand yellow of the disc in the photo, sampled from it. */
const BRAND = "#ffe400";

/** The photo's disc, measured from the source. */
const DISC = { cx: 512, cy: 512, r: 500 };

/**
 * Crop window over the flattened photo.
 *
 * The head only fills the middle of the 1024x1024 source, so cropping in is
 * what makes the face legible at 16px. The window is centred on the head
 * rather than on the image, and sized so the head fills about 70% of the
 * icon's height — enough headroom that the hair is not shaved off.
 */
const CROP = { left: 120, top: 70, width: 740, height: 740 };

/** Rounded-square mask, as a share of the icon's width. */
const RADIUS_RATIO = 0.22;

function roundedMask(size) {
  const r = Math.round(size * RADIUS_RATIO);
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/>` +
      `</svg>`,
  );
}

/**
 * The photo is a disc on white, so any crop wide enough to give the head
 * headroom drags white wedges in at the corners. Masking to the disc and
 * flattening onto the same yellow removes that constraint entirely: everything
 * outside the disc becomes brand colour, so the window can be placed on what
 * looks right rather than on what avoids the corners.
 */
const discMask = Buffer.from(
  `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="${DISC.cx}" cy="${DISC.cy}" r="${DISC.r}" fill="#fff"/>` +
    `</svg>`,
);

const flattened = await sharp(await readFile(source))
  .composite([{ input: discMask, blend: "dest-in" }])
  .flatten({ background: BRAND })
  .png()
  .toBuffer();

const base = sharp(flattened).extract(CROP);

/** Square icon with rounded, transparent corners — the app-icon look. */
async function rounded(size) {
  const square = await base
    .clone()
    .resize(size, size, { fit: "cover", kernel: "lanczos3" })
    .png()
    .toBuffer();

  return sharp(square)
    .composite([{ input: roundedMask(size), blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Minimal ICO writer.
 *
 * `.ico` is still worth shipping: a bare request to /favicon.ico arrives from
 * bookmarks and from crawlers that never parse the HTML, so a link tag alone
 * does not cover it. Since Vista an ICO may hold PNG data verbatim, so the
 * container is a 6-byte header plus one 16-byte directory entry per size.
 */
function encodeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    // 0 encodes 256; every size here is smaller, but the rule is part of the
    // format and cheap to honour.
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette size: 0 for truecolour
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const written = [];

// Browser tab and PWA icons.
for (const size of [32, 192, 512]) {
  const name = `icon-${size}.png`;
  await writeFile(resolve(publicDir, name), await rounded(size));
  written.push(name);
}

/**
 * iOS applies its own mask and paints transparency black, so this one is a
 * full opaque square rather than the rounded version above.
 */
await writeFile(
  resolve(publicDir, "apple-touch-icon.png"),
  await base.clone().resize(180, 180, { fit: "cover", kernel: "lanczos3" }).flatten({ background: BRAND }).png({ compressionLevel: 9 }).toBuffer(),
);
written.push("apple-touch-icon.png");

const ico = encodeIco(
  await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await rounded(size) }))),
);
await writeFile(resolve(publicDir, "favicon.ico"), ico);
written.push("favicon.ico");

// The monogram this replaces.
await unlink(resolve(publicDir, "favicon.svg")).catch(() => {});

console.log("wrote:", written.join(", "));
