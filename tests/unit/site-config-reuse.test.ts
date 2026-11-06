import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createModuleRegistry } from "@/admin/core/registry/module-registry";
import { buildNavigation } from "@/admin/core/registry/navigation";
import type { AdminModuleDefinition } from "@/admin/core/registry/types";

/**
 * Reuse proof.
 *
 * The core must not import the LONEX site configuration or the LONEX module
 * list. A second, differently branded deployment is simulated here with a
 * different module set and brand; it must work with the unchanged core.
 */

const CORE_DIR = path.resolve(process.cwd(), "src", "admin", "core");

function collectFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);

    if (statSync(full).isDirectory()) {
      files.push(...collectFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }

  return files;
}

describe("core reusability", () => {
  it("never imports a client configuration or module list", () => {
    const offenders: string[] = [];

    for (const file of collectFiles(CORE_DIR)) {
      const source = readFileSync(file, "utf8");

      if (
        /from\s+["']@\/admin\/config\//.test(source) ||
        /from\s+["']@\/admin\/modules/.test(source) ||
        /from\s+["']\.\.?\/.*config\//.test(source)
      ) {
        offenders.push(path.relative(process.cwd(), file));
      }
    }

    expect(offenders).toEqual([]);
  });

  it("runs unchanged with a different brand and module set", () => {
    const secondClientModules: AdminModuleDefinition[] = [
      {
        id: "catalogue",
        title: "Catalogue",
        navigationLabel: "Catalogue",
        description: "A non-LONEX business module.",
        basePath: "/console/catalogue",
        icon: "pages",
        group: "content",
        order: 5,
        requiredPermission: "catalogue.edit",
      },
      {
        id: "team",
        title: "Team",
        description: "A non-LONEX administration module.",
        basePath: "/console/team",
        icon: "users",
        group: "system",
        order: 10,
        requiredPermission: "team.manage",
      },
    ];

    const registry = createModuleRegistry(secondClientModules, {
      adminPath: "/console",
      enabledModules: ["catalogue", "team"],
    });

    expect(registry.adminPath).toBe("/console");
    expect(registry.getByPath("/console/catalogue/42")?.id).toBe("catalogue");

    const nav = buildNavigation(registry, new Set(["catalogue.edit"]));

    expect(nav).toHaveLength(1);
    expect(nav[0].items[0].href).toBe("/console/catalogue");
  });

  it("does not contain LONEX branding in the core", () => {
    const offenders: string[] = [];

    for (const file of collectFiles(CORE_DIR)) {
      if (/\bLONEX\b/.test(readFileSync(file, "utf8"))) {
        offenders.push(path.relative(process.cwd(), file));
      }
    }

    expect(offenders).toEqual([]);
  });
});
