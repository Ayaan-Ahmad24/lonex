import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = "artifacts/lonex-milestone-2c-review";
const files = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.name.toLowerCase().endsWith(".png")) {
      files.push(full);
    }
  }
}

await walk(root);

const results = [];
let invalid = 0;

for (const file of files.sort()) {
  const buffer = await readFile(file);
  const signature = buffer.subarray(0, 8).toString("hex");
  const info = await stat(file);
  if (signature !== "89504e470d0a1a0a" || buffer.length < 24) {
    invalid += 1;
    results.push({ file, valid: false, bytes: info.size });
    continue;
  }
  results.push({
    file: file.replaceAll("\\", "/"),
    valid: true,
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: info.size,
  });
}

const payload = {
  pngCount: results.length,
  invalid,
  byFolder: results.reduce((acc, item) => {
    const folder = path.posix.dirname(item.file).split("/").slice(-2).join("/");
    acc[folder] = (acc[folder] ?? 0) + 1;
    return acc;
  }, {}),
  files: results,
};

await writeFile(
  path.join(root, "reports/png-validation.json"),
  JSON.stringify(payload, null, 2),
);

console.log(JSON.stringify({ pngCount: payload.pngCount, invalid }, null, 2));
