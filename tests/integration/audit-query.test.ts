import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeDbPool } from "@/db/client";
import {
  listAuditEvents,
  listAuditTargetTypes,
} from "@/admin/core/audit/query";
import { recordAudit } from "@/lib/audit";
import { db } from "@/db/client";
import {
  cleanupFixtureUsers,
  closeTestPool,
  createFixtureUser,
  createTestPool,
  type TestDb,
} from "../helpers/db";

let pool: TestDb;
let actorId = "";
let actorEmail = "";
const createdUserIds: string[] = [];
const TARGET_TYPE = "vitest-audit";

beforeAll(async () => {
  pool = createTestPool();
  const actor = await createFixtureUser(pool, {
    role: "administrator",
    emailPrefix: "vitest-audit-actor",
  });
  actorId = actor.id;
  actorEmail = actor.email;
  createdUserIds.push(actorId);

  for (let index = 0; index < 3; index += 1) {
    await recordAudit(db, {
      actorUserId: actorId,
      action: `vitest.action.${index}`,
      targetType: TARGET_TYPE,
      targetId: `target-${index}`,
      metadata: { index },
    });
  }

  await recordAudit(db, {
    actorUserId: null,
    action: "vitest.system",
    targetType: "vitest-system",
    targetId: "system-1",
    metadata: null,
  });
});

afterAll(async () => {
  await pool.execute("DELETE FROM audit_log WHERE target_type LIKE 'vitest%'");
  await cleanupFixtureUsers(pool, createdUserIds);
  await closeTestPool(pool);
  await closeDbPool();
});

function params(overrides: Partial<import("@/admin/core/crud/types").ListParams> = {}) {
  return {
    q: "",
    page: 1,
    pageSize: 10,
    sort: "createdAt",
    direction: "desc" as const,
    filters: { targetType: TARGET_TYPE },
    ...overrides,
  };
}

describe("read-only audit queries", () => {
  it("lists events for one target type with the actor join", async () => {
    const result = await listAuditEvents(params());

    expect(result.total).toBe(3);
    expect(result.rows.every((row) => row.targetType === TARGET_TYPE)).toBe(true);
    expect(result.rows[0].actorName).toBe("Vitest Fixture");
    expect(result.rows[0].actorEmail).toBe(actorEmail);
  });

  it("paginates newest first", async () => {
    const first = await listAuditEvents(params({ pageSize: 2, page: 1 }));
    const second = await listAuditEvents(params({ pageSize: 2, page: 2 }));

    expect(first.rows).toHaveLength(2);
    expect(second.rows).toHaveLength(1);
    expect(first.pageCount).toBe(2);
    expect(first.rows[0].action).toBe("vitest.action.2");
  });

  it("searches by action and actor email", async () => {
    const byAction = await listAuditEvents(params({ q: "action.1" }));
    const byEmail = await listAuditEvents(params({ q: actorEmail }));

    expect(byAction.total).toBe(1);
    expect(byEmail.total).toBe(3);
  });

  it("exposes target types for filter options", async () => {
    const types = await listAuditTargetTypes();

    expect(types).toContain(TARGET_TYPE);
    expect(types).toContain("vitest-system");
  });

  it("keeps a null actor readable after the account is removed", async () => {
    const result = await listAuditEvents(
      params({ filters: { targetType: "vitest-system" } }),
    );

    expect(result.total).toBe(1);
    expect(result.rows[0].actorName).toBeNull();
    expect(result.rows[0].action).toBe("vitest.system");
  });
});
