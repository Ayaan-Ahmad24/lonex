import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Range section image preparation.
 *
 * The Generate / Store / Move chapters each need a crop that is composed for
 * the frame they sit in, not the frame they were shot in. This script takes
 * the existing local photography, crops it to the target aspect ratio around
 * the subject, applies the same restrained brand grade used on the hero
 * plates, and writes a WebP next to the other local assets.
 *
 * No image is generated, composited or altered in content — only cropped,
 * scaled and graded.
 */

const OUT_DIR = path.join(process.cwd(), "public", "images", "lonex-range");

const plates = [
  {
    // Two technicians on a rooftop. 4:3 crop keeps both figures and the
    // module run between them; the empty sky above the left worker is the
    // part that gets trimmed.
    out: "generate-solar.webp",
    src: "public/images/lonex-generated-images/lifestyle/solar-installation-team.webp",
    crop: { left: 165, top: 0, width: 745, height: 559 },
    width: 1120,
    quality: 84,
    grade: { saturation: 0.9, brightness: 0.99, linear: [1.03, -4] },
    alt: "Two technicians fitting solar modules to a rooftop — illustrative visual",
  },
  {
    // Wall-mounted inverter and two floor-standing battery units. The crop
    // keeps the plant edge for warmth and stops before the timber slats.
    out: "store-battery.webp",
    src: "public/images/lonex-generated-images/categories/home-storage.webp",
    crop: { left: 90, top: 0, width: 668, height: 501 },
    width: 1200,
    quality: 84,
    grade: { saturation: 0.9, brightness: 0.99, linear: [1.03, -4] },
    alt: "Wall-mounted inverter and two floor-standing home battery units — illustrative visual",
  },
];

await mkdir(OUT_DIR, { recursive: true });

for (const plate of plates) {
  const source = path.join(process.cwd(), plate.src);
  const destination = path.join(OUT_DIR, plate.out);

  const info = await sharp(source)
    .extract(plate.crop)
    .resize({
      width: plate.width,
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    })
    .modulate({
      saturation: plate.grade.saturation,
      brightness: plate.grade.brightness,
    })
    .linear(plate.grade.linear[0], plate.grade.linear[1])
    .sharpen({ sigma: 0.6 })
    .webp({ quality: plate.quality, effort: 6 })
    .toFile(destination);

  console.log(
    `${plate.out}  ${info.width}x${info.height}  ratio ${(info.width / info.height).toFixed(3)}  ${(info.size / 1024).toFixed(0)} kB`,
  );
}
