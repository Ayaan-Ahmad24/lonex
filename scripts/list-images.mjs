import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(webp|png|jpe?g)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const files = walk("public/images").sort();
for (const file of files) {
  try {
    const meta = await sharp(file).metadata();
    const kb = Math.round(statSync(file).size / 1024);
    console.log(
      `${String(meta.width).padStart(5)}x${String(meta.height).padEnd(5)}`,
      (meta.width / meta.height).toFixed(2).padStart(6),
      `${String(kb).padStart(5)}kB`,
      file.replace(/\\/g, "/"),
    );
  } catch {
    console.log("     ?            ?      ?", file);
  }
}
