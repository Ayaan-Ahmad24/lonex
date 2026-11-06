import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  adminPermissions,
  adminRolePermissions,
  adminUserRoles,
} from "@/db/schema";
import { getSessionUser } from "@/lib/session";

/**
 * Pure permission check, exported for unit tests.
 */
export function hasPermission(
  codes: ReadonlySet<string> | readonly string[],
  permission: string,
): boolean {
  if (Array.isArray(codes)) {
    return (codes as readonly string[]).includes(permission);
  }

  return (codes as ReadonlySet<string>).has(permission);
}

/**
 * Permission codes granted to a user through their roles.
 * Uncached: read from the database on every call (decision D-A4).
 */
export async function getUserPermissionCodes(
  userId: string,
): Promise<Set<string>> {
  const rows = await db
    .selectDistinct({ code: adminPermissions.code })
    .from(adminUserRoles)
    .innerJoin(
      adminRolePermissions,
      eq(adminRolePermissions.roleId, adminUserRoles.roleId),
    )
    .innerJoin(
      adminPermissions,
      eq(adminPermissions.id, adminRolePermissions.permissionId),
    )
    .where(eq(adminUserRoles.userId, userId));

  return new Set(rows.map((row) => row.code));
}

/**
 * Server-side access check for route handlers and server actions.
 * 401 = not signed in (or inactive), 403 = signed in without the permission.
 */
export async function authorize(permission: string) {
  const user = await getSessionUser();

  if (!user) {
    return { ok: false as const, status: 401 as const };
  }

  const codes = await getUserPermissionCodes(user.id);

  if (!hasPermission(codes, permission)) {
    return { ok: false as const, status: 403 as const };
  }

  return { ok: true as const, user };
}
