import type {
  AdminConfig,
  AdminModuleDefinition,
  AdminModuleRegistry,
} from "./types";

/**
 * Build the static module registry.
 *
 * Only compiled-in module definitions can be registered. The database never
 * supplies module paths, permissions or executable code. Duplicate ids and
 * duplicate/overlapping route roots fail fast so two modules can never claim
 * the same admin URL.
 */

const MODULE_ID = /^[a-z][a-z0-9-]*$/;

function normalizeBasePath(basePath: string): string {
  if (!basePath.startsWith("/")) {
    throw new Error(`Module basePath must start with "/": ${basePath}`);
  }

  const trimmed = basePath.replace(/\/+$/, "");

  if (trimmed.length === 0) {
    throw new Error("A module basePath cannot be the root.");
  }

  return trimmed;
}

function isSameOrChildPath(pathname: string, root: string): boolean {
  return pathname === root || pathname.startsWith(`${root}/`);
}

export function createModuleRegistry(
  modules: readonly AdminModuleDefinition[],
  config: Pick<AdminConfig, "adminPath" | "enabledModules">,
): AdminModuleRegistry {
  const adminPath = normalizeBasePath(config.adminPath);
  const ids = new Set<string>();
  const paths = new Set<string>();

  for (const definition of modules) {
    if (!MODULE_ID.test(definition.id)) {
      throw new Error(`Invalid module id: ${definition.id}`);
    }

    if (ids.has(definition.id)) {
      throw new Error(`Duplicate module id: ${definition.id}`);
    }

    if (!definition.requiredPermission.trim()) {
      throw new Error(`Module "${definition.id}" has no required permission.`);
    }

    const basePath = normalizeBasePath(definition.basePath);

    if (!isSameOrChildPath(basePath, adminPath) || basePath === adminPath) {
      throw new Error(
        `Module "${definition.id}" must live below the admin path "${adminPath}".`,
      );
    }

    if (paths.has(basePath)) {
      throw new Error(`Duplicate module path: ${basePath}`);
    }

    // Overlapping roots would make getByPath ambiguous.
    for (const existing of paths) {
      if (
        isSameOrChildPath(basePath, existing) ||
        isSameOrChildPath(existing, basePath)
      ) {
        throw new Error(
          `Module path "${basePath}" overlaps existing path "${existing}".`,
        );
      }
    }

    ids.add(definition.id);
    paths.add(basePath);
  }

  const enabledIds = new Set(config.enabledModules);
  const enabled = modules.filter((definition) => enabledIds.has(definition.id));

  return {
    adminPath,
    modules,
    enabled,
    get(moduleId) {
      return modules.find((definition) => definition.id === moduleId);
    },
    getEnabled(moduleId) {
      return enabled.find((definition) => definition.id === moduleId);
    },
    getByPath(pathname) {
      const clean = pathname.split("?")[0].replace(/\/+$/, "") || "/";
      let match: AdminModuleDefinition | undefined;

      for (const definition of enabled) {
        const root = normalizeBasePath(definition.basePath);

        if (isSameOrChildPath(clean, root)) {
          if (!match || root.length > match.basePath.length) {
            match = definition;
          }
        }
      }

      return match;
    },
    isEnabled(moduleId) {
      return enabledIds.has(moduleId) && modules.some((m) => m.id === moduleId);
    },
  };
}

/** Deterministic ordering used by navigation and tests. */
export function compareModules(
  a: AdminModuleDefinition,
  b: AdminModuleDefinition,
): number {
  return a.order - b.order || a.id.localeCompare(b.id);
}
