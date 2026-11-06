import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeDbPool } from "@/db/client";
import {
  deactivateUserAtomic,
  reactivateUserAtomic,
  updateUserRoleAtomic,
} from "@/lib/admin/deactivate-user";
import {
  cleanupFixtureUsers,
  closeTestPool,
  createFixtureSession,
  createFixtureUser,
  readUserState,
  createTestPool,
  type TestDb,
} from "../helpers/db";

let pool: TestDb;
let actorId = "";
const createdUserIds: string[] = [];

beforeAll(async () => {
  pool = createTestPool();
  const actor = await createFixtureUser(pool, {
    role: "administrator",
    emailPrefix: "vitest-role-actor",
  });
  actorId = actor.id;
  createdUserIds.push(actorId);
});

afterAll(async () => {
  await cleanupFixtureUsers(pool, createdUserIds);
  await closeTestPool(pool);
  await closeDbPool();
});

describe("administrator role management", () => {
  it("refuses a self role change", async () => {
    const result = await updateUserRoleAtomic({
      actorUserId: actorId,
      targetId: actorId,
      roleSlug: "editor",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.message).toMatch(/your own role/i);
    }
  });

  it("changes a role and audits the from/to transition", async () => {
    const target = await createFixtureUser(pool, {
      role: "editor",
      emailPrefix: "vitest-role-promote",
    });
    createdUserIds.push(target.id);

    const result = await updateUserRoleAtomic({
      actorUserId: actorId,
      targetId: target.id,
      roleSlug: "administrator",
    });

    expect(result).toEqual({ ok: true, role: "administrator" });

    const [[role]] = await pool.execute<import("mysql2").RowDataPacket[]>(
      "SELECT r.slug FROM admin_user_roles ur JOIN admin_roles r ON r.id = ur.role_id WHERE ur.user_id = ?",
      [target.id],
    );

    expect(role.slug).toBe("administrator");

    const [[audit]] = await pool.execute<import("mysql2").RowDataPacket[]>(
      "SELECT action, metadata FROM audit_log WHERE target_id = ? AND action = 'user.role.update'",
      [target.id],
    );

    const metadata =
      typeof audit.metadata === "string" ? JSON.parse(audit.metadata) : audit.metadata;

    expect(metadata).toEqual({ from: "editor", to: "administrator" });
  });

  it("treats an unchanged role as a no-op without an audit row", async () => {
    const target = await createFixtureUser(pool, {
      role: "editor",
      emailPrefix: "vitest-role-noop",
    });
    createdUserIds.push(target.id);

    const result = await updateUserRoleAtomic({
      actorUserId: actorId,
      targetId: target.id,
      roleSlug: "editor",
    });

    expect(result).toEqual({ ok: true, role: "editor" });

    const [[row]] = await pool.execute<import("mysql2").RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM audit_log WHERE target_id = ? AND action = 'user.role.update'",
      [target.id],
    );

    expect(Number(row.total)).toBe(0);
  });

  it("returns not_found for a missing target or role", async () => {
    const missing = await updateUserRoleAtomic({
      actorUserId: actorId,
      targetId: "00000000-0000-4000-8000-000000000000",
      roleSlug: "editor",
    });

    expect(missing.ok).toBe(false);

    const target = await createFixtureUser(pool, {
      role: "editor",
      emailPrefix: "vitest-role-missing",
    });
    createdUserIds.push(target.id);

    const badRole = await updateUserRoleAtomic({
      actorUserId: actorId,
      targetId: target.id,
      roleSlug: "superuser" as unknown as "editor",
    });

    expect(badRole.ok).toBe(false);

    if (!badRole.ok) {
      expect(badRole.message).toMatch(/role not found/i);
    }
  });
});

describe("reactivation", () => {
  it("reactivates an inactive account and audits it", async () => {
    const target = await createFixtureUser(pool, {
      role: "editor",
      isActive: false,
      emailPrefix: "vitest-reactivate",
    });
    createdUserIds.push(target.id);

    const result = await reactivateUserAtomic({
      actorUserId: actorId,
      targetId: target.id,
    });

    expect(result).toBe("reactivated");
    expect((await readUserState(pool, target.id)).isActive).toBe(1);

    const [[audit]] = await pool.execute<import("mysql2").RowDataPacket[]>(
      "SELECT action FROM audit_log WHERE target_id = ?",
      [target.id],
    );

    expect(audit.action).toBe("user.reactivate");
  });

  it("returns not_found for a missing account", async () => {
    const result = await reactivateUserAtomic({
      actorUserId: actorId,
      targetId: "00000000-0000-4000-8000-000000000000",
    });

    expect(result).toBe("not_found");
  });
});

describe("deactivation safety", () => {
  it("revokes sessions and keeps transaction semantics", async () => {
    const target = await createFixtureUser(pool, {
      role: "editor",
      emailPrefix: "vitest-deactivate-safety",
    });
    createdUserIds.push(target.id);
    await createFixtureSession(pool, target.id);

    const result = await deactivateUserAtomic({
      actorUserId: actorId,
      targetId: target.id,
    });

    expect(result).toBe("deactivated");

    const state = await readUserState(pool, target.id);

    expect(state).toEqual({ isActive: 0, sessions: 0, auditRows: 1 });
  });
});
