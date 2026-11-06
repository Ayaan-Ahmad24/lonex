import "server-only";

import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { getUserPermissionCodes } from "@/lib/rbac";
import { getSessionUser } from "@/lib/session";
import type { AdminModuleRegistry } from "./registry/types";
import { permissionGranted } from "./registry/navigation";

export type AdminUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

export type AdminContext = {
  user: AdminUser;
  permissions: Set<string>;
};

const getPermissions = cache(
  async (userId: string): Promise<Set<string>> =>
    getUserPermissionCodes(userId),
);

/**
 * Request-scoped server guard for admin pages and server actions.
 *
 * The proxy only checks that a session cookie exists. This function verifies
 * the session, the active-user flag and loads current permissions.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/admin/login");
  }

  return { user, permissions: await getPermissions(user.id) };
}

export async function requirePermission(
  permission: string,
): Promise<AdminContext> {
  const context = await requireAdmin();

  if (!permissionGranted(context.permissions, permission)) {
    redirect("/admin/forbidden");
  }

  return context;
}

/**
 * Guard a module route. A module that is not enabled in site configuration
 * behaves as if it does not exist. A user without the module permission gets
 * the 403 page.
 */
export async function requireModule(
  registry: AdminModuleRegistry,
  moduleId: string,
): Promise<AdminContext & { module: NonNullable<ReturnType<AdminModuleRegistry["getEnabled"]>> }> {
  const context = await requireAdmin();
  const definition = registry.getEnabled(moduleId);

  if (!definition) {
    notFound();
  }

  if (!permissionGranted(context.permissions, definition.requiredPermission)) {
    redirect("/admin/forbidden");
  }

  return { ...context, module: definition };
}

export type ActionAuthorization =
  | { ok: true; user: AdminUser; permissions: Set<string> }
  | { ok: false; status: 401 | 403 };

/**
 * Authorization for server actions. Unlike the page guard it returns a result
 * so the action can show an error and never performs a mutation on failure.
 */
export async function authorizeAction(
  permission: string,
): Promise<ActionAuthorization> {
  const user = await getSessionUser();

  if (!user) {
    return { ok: false, status: 401 };
  }

  const permissions = await getPermissions(user.id);

  if (!permissionGranted(permissions, permission)) {
    return { ok: false, status: 403 };
  }

  return { ok: true, user, permissions };
}

export function isAdminModuleEnabled(
  registry: AdminModuleRegistry,
  moduleId: string,
): boolean {
  return registry.isEnabled(moduleId);
}
