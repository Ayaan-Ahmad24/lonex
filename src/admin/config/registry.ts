import { createModuleRegistry } from "@/admin/core/registry/module-registry";
import type { AdminConfig } from "@/admin/core/registry/types";
import { adminModules } from "@/admin/modules";
import { siteConfig } from "./site";

/**
 * Composition root: the only place where a client's configuration and brand
 * are joined to the client-agnostic core. Core code must never import this
 * file or the LONEX modules.
 */
export const adminConfig: AdminConfig = {
  brand: siteConfig.admin,
  adminPath: siteConfig.adminPath,
  enabledModules: siteConfig.enabledModules,
};

export const adminRegistry = createModuleRegistry(adminModules, adminConfig);

export { adminModules };
