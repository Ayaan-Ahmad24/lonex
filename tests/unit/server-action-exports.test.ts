import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import path from "node:path";

/**
 * Ensures every `"use server"` module exports only async functions.
 *
 * Next.js requires that Server Action files only export async functions.
 * Exporting objects, classes or non-async functions causes a runtime 500.
 */
function findServerFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...findServerFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      results.push(full);
    }
  }

  return results;
}

function getServerExports(filePath: string): string[] {
  const source = fs.readFileSync(filePath, "utf8");
  const useServer = /^\s*"use server"\s*;?\s*$/m.test(source);

  if (!useServer) {
    return [];
  }

  // Match `export async function name(` and `export const name = async ...`
  const asyncExports = new Set<string>();
  const asyncRegex =
    /export\s+async\s+(?:function\s+(\w+)|const\s+(\w+)\s*=\s*async)/g;
  let match: RegExpExecArray | null;

  while ((match = asyncRegex.exec(source)) !== null) {
    asyncExports.add(match[1] ?? match[2]);
  }

  // Match all other exports (non-async functions, objects, classes, values)
  const allExports = new Set<string>();
  const allRegex = /export\s+(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)|let\s+(\w+)|var\s+(\w+)|class\s+(\w+)|type\s+(\w+)|interface\s+(\w+)|{[\s\S]*?})/g;

  while ((match = allRegex.exec(source)) !== null) {
    for (let i = 1; i <= 7; i++) {
      if (match[i]) {
        allExports.add(match[i]);
      }
    }
  }

  // Non-async exports are the ones in allExports but not in asyncExports
  return [...allExports].filter((name) => !asyncExports.has(name));
}

describe('"use server" export rule', () => {
  it("has no unsupported exports in any Server Action module", () => {
    const srcDir = path.resolve(process.cwd(), "src");
    const serverFiles = findServerFiles(srcDir);
    const violations: Array<{ file: string; exports: string[] }> = [];

    for (const file of serverFiles) {
      const nonAsync = getServerExports(file);

      if (nonAsync.length > 0) {
        violations.push({ file, exports: nonAsync });
      }
    }

    expect(violations).toEqual([]);
  });
});
