import type { AdminModuleDefinition } from "@/admin/core/registry/types";
import {
  auditModule,
  blogModule,
  categoriesModule,
  mediaModule,
  productsModule,
  sellersModule,
  settingsModule,
  usersModule,
  verificationModule,
} from "./definitions";

/**
 * Static, trusted LONEX module registry input.
 *
 * Deliberately an array literal, not a database query and not a dynamic
 * import. Adding a module requires a code change and review.
 */
export const adminModules: readonly AdminModuleDefinition[] = [
  categoriesModule,
  productsModule,
  sellersModule,
  verificationModule,
  blogModule,
  mediaModule,
  settingsModule,
  usersModule,
  auditModule,
];
