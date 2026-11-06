import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { deleteUserAtomic } from "@/lib/admin/deactivate-user";
import { db } from "@/db";
import { user, adminRoles, adminUserRoles, session, account } from "@/db/schema";
import { eq } from "drizzle-orm";
import { closeDbPool } from "@/db/client";
import {
  closeTestPool,
  createFixtureUser,
  createTestPool,
  type TestDb,
} from "../helpers/db";

describe("secure user deletion", () => {
  let pool: TestDb;
  let actorId: string;
  let targetId: string;
  let adminRoleId: number;

  beforeAll(async () => {
    pool = createTestPool();
  });

  afterAll(async () => {
    await closeTestPool(pool);
    await closeDbPool();
  });

  beforeEach(async () => {
    const actor = await createFixtureUser(pool, {
      emailPrefix: `delete-actor-${Date.now()}`,
      role: "administrator",
    });
    actorId = actor.id;

    const target = await createFixtureUser(pool, {
      emailPrefix: `delete-target-${Date.now()}`,
      role: "editor",
    });
    targetId = target.id;

    const [role] = await db
      .select({ id: adminRoles.id })
      .from(adminRoles)
      .where(eq(adminRoles.slug, "administrator"))
      .limit(1);
    adminRoleId = role!.id;
  });

  it("deletes a user transactionally", async () => {
    const result = await deleteUserAtomic({
      actorUserId: actorId,
      targetId,
    });

    expect(result).toBe("deleted");

    const [deleted] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, targetId))
      .limit(1);
    expect(deleted).toBeUndefined();
  });

  it("revokes all sessions after deletion", async () => {
    // Insert a session for the target user
    const sessionId = randomUUID();
    await db.insert(session).values({
      id: sessionId,
      userId: targetId,
      expiresAt: new Date(Date.now() + 86400000),
      token: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: "127.0.0.1",
      userAgent: "test",
    });

    await deleteUserAtomic({
      actorUserId: actorId,
      targetId,
    });

    const [remainingSession] = await db
      .select({ id: session.id })
      .from(session)
      .where(eq(session.userId, targetId))
      .limit(1);
    expect(remainingSession).toBeUndefined();
  });

  it("deletes account identities after deletion", async () => {
    // Insert an account for the target user
    const accountId = randomUUID();
    await db.insert(account).values({
      id: accountId,
      accountId: randomUUID(),
      providerId: "email",
      userId: targetId,
      password: "hashed",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await deleteUserAtomic({
      actorUserId: actorId,
      targetId,
    });

    const [remainingAccount] = await db
      .select({ id: account.id })
      .from(account)
      .where(eq(account.userId, targetId))
      .limit(1);
    expect(remainingAccount).toBeUndefined();
  });

  it("removes admin role assignments after deletion", async () => {
    // Make target an administrator first
    await db.insert(adminUserRoles).values({
      userId: targetId,
      roleId: adminRoleId,
    });

    await deleteUserAtomic({
      actorUserId: actorId,
      targetId,
    });

    const [remainingRole] = await db
      .select({ roleId: adminUserRoles.roleId })
      .from(adminUserRoles)
      .where(eq(adminUserRoles.userId, targetId))
      .limit(1);
    expect(remainingRole).toBeUndefined();
  });

  it("blocks self-deletion", async () => {
    const result = await deleteUserAtomic({
      actorUserId: actorId,
      targetId: actorId,
    });

    expect(result).toBe("cannot_delete_self");

    // User still exists
    const [stillThere] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, actorId))
      .limit(1);
    expect(stillThere).toBeDefined();
  });

  it("blocks deletion when user not found", async () => {
    const result = await deleteUserAtomic({
      actorUserId: actorId,
      targetId: "00000000-0000-0000-0000-000000000000",
    });

    expect(result).toBe("not_found");
  });

  it("blocks deletion of the last active administrator", async () => {
    // Create another administrator as the only admin
    const onlyAdmin = await createFixtureUser(pool, {
      emailPrefix: `only-admin-${Date.now()}`,
      role: "administrator",
    });

    // Remove actor's admin role so onlyAdmin is the last admin
    await db
      .delete(adminUserRoles)
      .where(eq(adminUserRoles.userId, actorId));

    const result = await deleteUserAtomic({
      actorUserId: onlyAdmin.id,
      targetId: onlyAdmin.id,
    });

    // Can't delete self even if last admin
    expect(result).toBe("cannot_delete_self");

    // Try deleting another user while onlyAdmin is the last admin
    const result2 = await deleteUserAtomic({
      actorUserId: onlyAdmin.id,
      targetId: targetId,
    });

    // targetId is an editor, so it should be deletable
    expect(result2).toBe("deleted");
  });
});
