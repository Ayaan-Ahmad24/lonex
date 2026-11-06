import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db, closeDbPool } from "@/db/client";
import {
  deactivateUser,
  deactivateUserAtomic,
} from "@/lib/admin/deactivate-user";
import {
  cleanupFixtureUsers,
  closeTestPool,
  createFixtureSession,
  createFixtureUser,
  createTestPool,
  readUserState,
  type TestDb,
} from "../helpers/db";

let pool: TestDb;
let actorId = "";
const createdUserIds: string[] = [];

beforeAll(async () => {
  pool = createTestPool();
  ({ id: actorId } = await createFixtureUser(pool, {
    role: "administrator",
    emailPrefix: "vitest-actor",
  }));
  createdUserIds.push(actorId);
});

afterAll(async () => {
  await cleanupFixtureUsers(pool, createdUserIds);
  await closeTestPool(pool);
  await closeDbPool();
});

describe("user deactivation transaction", () => {
  it("deactivates the user, revokes sessions and writes one audit row", async () => {
    const target = await createFixtureUser(pool, {
      role: "editor",
      emailPrefix: "vitest-target-ok",
    });
    createdUserIds.push(target.id);
    await createFixtureSession(pool, target.id);
    await createFixtureSession(pool, target.id);

    const result = await deactivateUserAtomic({
      actorUserId: actorId,
      targetId: target.id,
    });

    expect(result).toBe("deactivated");

    const state = await readUserState(pool, target.id);

    expect(state.isActive).toBe(0);
    expect(state.sessions).toBe(0);
    expect(state.auditRows).toBe(1);

    const [[audit]] = await pool.execute<import("mysql2").RowDataPacket[]>(
      "SELECT actor_user_id, action, target_type FROM audit_log WHERE target_id = ?",
      [target.id],
    );

    expect(audit.actor_user_id).toBe(actorId);
    expect(audit.action).toBe("user.deactivate");
    expect(audit.target_type).toBe("user");
  });

  it("rolls back the whole transaction when the audit insert fails", async () => {
    const target = await createFixtureUser(pool, {
      role: "editor",
      emailPrefix: "vitest-target-rollback",
    });
    createdUserIds.push(target.id);
    await createFixtureSession(pool, target.id);

    const before = await readUserState(pool, target.id);

    await expect(
      db.transaction((tx) =>
        deactivateUser(tx, {
          // No such user: the audit FK rejects the insert.
          actorUserId: "00000000-0000-4000-8000-000000000000",
          targetId: target.id,
        }),
      ),
    ).rejects.toThrow();

    const after = await readUserState(pool, target.id);

    expect(after).toEqual(before);
    expect(after.isActive).toBe(1);
    expect(after.sessions).toBe(1);
    expect(after.auditRows).toBe(0);
  });

  it("returns not_found without writing anything", async () => {
    const missingId = randomUUID();

    const result = await deactivateUserAtomic({
      actorUserId: actorId,
      targetId: missingId,
    });

    expect(result).toBe("not_found");

    const state = await readUserState(pool, missingId);

    expect(state.auditRows).toBe(0);
  });

  it("keeps an already-inactive user inactive and still audits the action", async () => {
    const target = await createFixtureUser(pool, {
      role: "editor",
      emailPrefix: "vitest-target-inactive",
      isActive: false,
    });
    createdUserIds.push(target.id);

    const result = await deactivateUserAtomic({
      actorUserId: actorId,
      targetId: target.id,
    });

    expect(result).toBe("deactivated");

    const state = await readUserState(pool, target.id);

    expect(state.isActive).toBe(0);
    expect(state.sessions).toBe(0);
    expect(state.auditRows).toBe(1);
  });
});
