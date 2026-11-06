import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getUserPermissionCodes } from "@/lib/rbac";
import { closeDbPool } from "@/db/client";
import {
  cleanupFixtureUsers,
  closeTestPool,
  createFixtureUser,
  createTestPool,
  type TestDb,
} from "../helpers/db";

let pool: TestDb;
let adminId = "";
let editorId = "";
let inactiveId = "";

beforeAll(async () => {
  pool = createTestPool();
  ({ id: adminId } = await createFixtureUser(pool, { role: "administrator" }));
  ({ id: editorId } = await createFixtureUser(pool, { role: "editor" }));
  ({ id: inactiveId } = await createFixtureUser(pool, {
    role: "editor",
    isActive: false,
  }));
});

afterAll(async () => {
  await cleanupFixtureUsers(pool, [adminId, editorId, inactiveId]);
  await closeTestPool(pool);
  await closeDbPool();
});

describe("RBAC permission resolution", () => {
  it("grants users.manage to an administrator", async () => {
    const codes = await getUserPermissionCodes(adminId);

    expect(codes.has("users.manage")).toBe(true);
  });

  it("does not grant users.manage to an editor", async () => {
    const codes = await getUserPermissionCodes(editorId);

    expect(codes.has("users.manage")).toBe(false);
    expect(codes.size).toBeGreaterThan(0);
  });

  it("returns no permissions for an unknown user", async () => {
    const codes = await getUserPermissionCodes(
      "00000000-0000-4000-8000-000000000000",
    );

    expect(codes.size).toBe(0);
  });

  it("keeps the inactive fixture in the database but with is_active = 0", async () => {
    const [[row]] = await pool.execute<import("mysql2").RowDataPacket[]>(
      "SELECT is_active FROM `user` WHERE id = ?",
      [inactiveId],
    );

    expect(Number(row.is_active)).toBe(0);
  });
});
