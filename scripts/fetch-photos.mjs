// One-off asset pipeline: download curated Pexels frames and write local WebP masters.
// Usage: node scripts/fetch-photos.mjs   (skips files that already exist)
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "images", "v2");

// `grade` is applied after resize: a little desaturation and contrast so the
// photography sits closer to the stone/ink palette.
const photos = [
  {
    file: "hero-solar-aerial",
    id: "9893731",
    width: 2200,
    grade: { saturation: 0.84, brightness: 1.02, linear: [1.05, -8] },
    alt: "Rows of solar panels seen from above at low sun, their blue cells running in long diagonal lines",
  },
  {
    file: "generate-installation",
    id: "30285845",
    width: 2000,
    alt: "An installer fixing cabling between solar modules on a rooftop",
  },
  {
    file: "move-city",
    id: "9538575",
    width: 2000,
    alt: "A black electric bicycle parked inside a modern building",
  },
  {
    file: "city-rooftops",
    id: "12530460",
    width: 1800,
    grade: { saturation: 0.82, brightness: 1.01, linear: [1.04, -6] },
    alt: "Solar modules on city rooftops seen from above",
  },
  {
    file: "craft-panel",
    id: "9875418",
    width: 2000,
    alt: "A technician lifting a solar module onto a roof mounting rail",
  },
];

await mkdir(OUT, { recursive: true });

for (const photo of photos) {
  const url = `https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?auto=compress&cs=tinysrgb&w=${photo.width}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`FAIL ${photo.file}: HTTP ${res.status}`);
    continue;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const out = path.join(OUT, `${photo.file}.webp`);

  let pipeline = sharp(buffer).resize({
    width: photo.width,
    withoutEnlargement: true,
  });

  if (photo.grade) {
    pipeline = pipeline
      .modulate({
        saturation: photo.grade.saturation,
        brightness: photo.grade.brightness,
      })
      .linear(photo.grade.linear[0], photo.grade.linear[1]);
  }

  const info = await pipeline.webp({ quality: 72, effort: 6 }).toFile(out);
  console.log(
    `${photo.file}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`,
  );
}
