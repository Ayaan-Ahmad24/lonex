import { and, asc, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { db } from "@/db";
import {
  adminRoles,
  adminUserRoles,
  auditLog,
  session,
  user,
} from "@/db/schema";
import type { ListParams, ListResult } from "@/admin/core/crud/types";
import { pageCountFor } from "@/admin/core/crud/list-params";

export type UserListRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  roles: string[];
};

const USER_SORTS = {
  createdAt: user.createdAt,
  name: user.name,
  email: user.email,
  status: user.isActive,
} as const;

function isUserSort(value: string): value is keyof typeof USER_SORTS {
  return Object.prototype.hasOwnProperty.call(USER_SORTS, value);
}

export async function listUsers(
  params: ListParams,
): Promise<ListResult<UserListRow>> {
  const conditions = [];

  if (params.q) {
    conditions.push(
      or(
        like(user.name, `%${params.q}%`),
        like(user.email, `%${params.q}%`),
      ),
    );
  }

  const status = params.filters.status;

  if (status === "active" || status === "inactive") {
    conditions.push(eq(user.isActive, status === "active"));
  }

  const role = params.filters.role;

  if (role === "administrator" || role === "editor") {
    const roleUserIds = db
      .select({ userId: adminUserRoles.userId })
      .from(adminUserRoles)
      .innerJoin(adminRoles, eq(adminRoles.id, adminUserRoles.roleId))
      .where(eq(adminRoles.slug, role));

    conditions.push(inArray(user.id, roleUserIds));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const sortColumn = isUserSort(params.sort)
    ? USER_SORTS[params.sort]
    : USER_SORTS.createdAt;
  const order = params.direction === "asc" ? asc(sortColumn) : desc(sortColumn);

  const [countRow] = await db
    .select({ total: count() })
    .from(user)
    .where(where);
  const total = Number(countRow?.total ?? 0);
  const page = Math.min(params.page, pageCountFor(total, params.pageSize));

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(where)
    .orderBy(order, desc(user.id))
    .limit(params.pageSize)
    .offset((page - 1) * params.pageSize);

  const rolesByUser = await loadRoles(rows.map((row) => row.id));

  return {
    rows: rows.map((row) => ({
      ...row,
      roles: rolesByUser.get(row.id) ?? [],
    })),
    total,
    page,
    pageSize: params.pageSize,
    pageCount: pageCountFor(total, params.pageSize),
  };
}

async function loadRoles(userIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();

  if (userIds.length === 0) {
    return map;
  }

  const rows = await db
    .select({ userId: adminUserRoles.userId, slug: adminRoles.slug })
    .from(adminUserRoles)
    .innerJoin(adminRoles, eq(adminRoles.id, adminUserRoles.roleId))
    .where(inArray(adminUserRoles.userId, userIds))
    .orderBy(asc(adminRoles.id));

  for (const row of rows) {
    const list = map.get(row.userId) ?? [];
    list.push(row.slug);
    map.set(row.userId, list);
  }

  return map;
}

export async function getUserDetail(id: string) {
  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  if (!row) {
    return null;
  }

  const roles = await loadRoles([id]);
  const [sessionCount] = await db
    .select({ total: count() })
    .from(session)
    .where(eq(session.userId, id));
  const recentAudit = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(eq(auditLog.targetId, id))
    .orderBy(desc(auditLog.createdAt))
    .limit(5);

  return {
    ...row,
    roles: roles.get(id) ?? [],
    sessionCount: Number(sessionCount?.total ?? 0),
    recentAudit,
  };
}

export async function countActiveAdministrators(): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(adminUserRoles)
    .innerJoin(adminRoles, eq(adminRoles.id, adminUserRoles.roleId))
    .innerJoin(user, eq(user.id, adminUserRoles.userId))
    .where(and(eq(adminRoles.slug, "administrator"), eq(user.isActive, true)));

  return Number(row?.total ?? 0);
}
