import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Company story photograph.
 *
 * The story section is led by one large architectural frame, so the plate is
 * cropped for that frame rather than left to the browser: a 4:5 portrait cut
 * that keeps the sky, the roof pitch and the full run of the panel array.
 *
 * Source: Pexels 35726122 "Modern Rooftop Solar Panels and Tiled Roof A" by
 * Budget Bizar — https://www.pexels.com/photo/35726122/ — Pexels licence.
 * The grade matches the hero and range plates.
 */

const PHOTO_ID = 35726122;
const OUT_DIR = path.join(process.cwd(), "public", "images", "lonex-story");
const OUT_FILE = path.join(OUT_DIR, "story-architecture.webp");

const SOURCE_WIDTH = 2400;
const RATIO = 4 / 5;
const OUTPUT_WIDTH = 1320;

await mkdir(OUT_DIR, { recursive: true });

const url =
  `https://images.pexels.com/photos/${PHOTO_ID}/pexels-photo-${PHOTO_ID}.jpeg` +
  `?auto=compress&cs=tinysrgb&w=${SOURCE_WIDTH}`;

const response = await fetch(url);
if (!response.ok) {
  console.error(`FAIL: HTTP ${response.status}`);
  process.exit(1);
}
const buffer = Buffer.from(await response.arrayBuffer());

const source = sharp(buffer);
const meta = await source.metadata();

/* A 4:5 portrait cut that starts below the sky line, so the roof pitch,
   the panel array, the rendered wall and the window all sit inside the
   frame. The building reads immediately — no empty sky. */
const cropWidth = Math.min(meta.width, 2000);
const cropHeight = Math.round(cropWidth / RATIO);
const cropLeft = Math.round((meta.width - cropWidth) / 2);
const cropTop = Math.min(meta.height - cropHeight, 1100);

const info = await source
  .extract({
    left: cropLeft,
    top: cropTop,
    width: cropWidth,
    height: cropHeight,
  })
  .resize({
    width: OUTPUT_WIDTH,
    withoutEnlargement: false,
    kernel: sharp.kernel.lanczos3,
  })
  .modulate({ saturation: 0.9, brightness: 0.99 })
  .linear(1.03, -4)
  .sharpen({ sigma: 0.5 })
  .webp({ quality: 84, effort: 6 })
  .toFile(OUT_FILE);

console.log(
  `story-architecture.webp  ${info.width}x${info.height}  ratio ${(info.width / info.height).toFixed(3)}  ${(info.size / 1024).toFixed(0)} kB`,
);
