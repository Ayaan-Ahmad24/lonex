import { db } from "@/db";
import { auditLog } from "@/db/schema";

// Accepts the db or a transaction (tx), so the audit row commits or
// rolls back together with the change it describes.
type AuditExecutor = Pick<typeof db, "insert">;

export type AuditEntry = {
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  // Never put passwords, tokens or other secrets in metadata.
  metadata?: Record<string, unknown> | null;
};

export async function recordAudit(executor: AuditExecutor, entry: AuditEntry) {
  await executor.insert(auditLog).values({
    actorUserId: entry.actorUserId,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId ?? null,
    metadata: entry.metadata ?? null,
  });
}