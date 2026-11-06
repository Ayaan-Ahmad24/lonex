import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import { auditLog, user } from "@/db/schema";
import type { ListParams, ListResult } from "../crud/types";
import { pageCountFor } from "../crud/list-params";

export type AuditListRow = {
  id: number;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: unknown;
  createdAt: Date;
  actorName: string | null;
  actorEmail: string | null;
};

export async function listAuditEvents(
  params: ListParams,
): Promise<ListResult<AuditListRow>> {
  const conditions = [];

  if (params.q) {
    conditions.push(
      or(
        like(auditLog.action, `%${params.q}%`),
        like(auditLog.targetType, `%${params.q}%`),
        like(auditLog.targetId, `%${params.q}%`),
        like(user.email, `%${params.q}%`),
        like(user.name, `%${params.q}%`),
      ),
    );
  }

  if (params.filters.targetType) {
    conditions.push(eq(auditLog.targetType, params.filters.targetType));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await db
    .select({ total: count() })
    .from(auditLog)
    .leftJoin(user, eq(user.id, auditLog.actorUserId))
    .where(where);
  const total = Number(countRow?.total ?? 0);
  const page = Math.min(params.page, pageCountFor(total, params.pageSize));

  const rows = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt,
      actorName: user.name,
      actorEmail: user.email,
    })
    .from(auditLog)
    .leftJoin(user, eq(user.id, auditLog.actorUserId))
    .where(where)
    .orderBy(desc(auditLog.createdAt), desc(auditLog.id))
    .limit(params.pageSize)
    .offset((page - 1) * params.pageSize);

  return {
    rows,
    total,
    page,
    pageSize: params.pageSize,
    pageCount: pageCountFor(total, params.pageSize),
  };
}

export async function listAuditTargetTypes(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ targetType: auditLog.targetType })
    .from(auditLog)
    .orderBy(auditLog.targetType);

  return rows.map((row) => row.targetType);
}
