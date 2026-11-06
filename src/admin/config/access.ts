import "server-only";

import { requireAdmin, requireModule } from "@/admin/core/guards";
import { adminRegistry } from "./registry";

/** Page-level guard bound to this deployment's static registry. */
export async function requireAdminModule(moduleId: string) {
  return requireModule(adminRegistry, moduleId);
}

export async function requireAdminContext() {
  return requireAdmin();
}
