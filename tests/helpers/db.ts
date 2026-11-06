import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";

/**
 * Integration-test fixtures.
 *
 * All rows are synthetic (`*.invalid` addresses) and are deleted in the test's
 * `finally`/`afterAll`. Existing administrator accounts are never modified.
 */

export type TestDb = mysql.Pool;

export function createTestPool(): TestDb {
  return mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 2,
  });
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${randomUUID()}@example.invalid`;
}

export async function getRoleId(
  pool: TestDb,
  slug: "administrator" | "editor",
): Promise<number> {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    "SELECT id FROM admin_roles WHERE slug = ? LIMIT 1",
    [slug],
  );

  if (rows.length === 0) {
    throw new Error(`Seed role "${slug}" is missing.`);
  }

  return Number(rows[0].id);
}

export async function createFixtureUser(
  pool: TestDb,
  options: {
    role: "administrator" | "editor";
    isActive?: boolean;
    emailPrefix?: string;
  },
): Promise<{ id: string; email: string }> {
  const id = randomUUID();
  const email = uniqueEmail(options.emailPrefix ?? "vitest-user");
  const roleId = await getRoleId(pool, options.role);
  const now = new Date();

  await pool.execute(
    "INSERT INTO `user` (id, name, email, email_verified, created_at, updated_at, is_active) VALUES (?, ?, ?, 1, ?, ?, ?)",
    [id, "Vitest Fixture", email, now, now, options.isActive === false ? 0 : 1],
  );
  await pool.execute(
    "INSERT INTO admin_user_roles (user_id, role_id) VALUES (?, ?)",
    [id, roleId],
  );

  return { id, email };
}

export async function createFixtureSession(
  pool: TestDb,
  userId: string,
): Promise<string> {
  const id = randomUUID();
  const now = new Date();

  await pool.execute(
    "INSERT INTO `session` (id, expires_at, token, created_at, updated_at, user_id) VALUES (?, ?, ?, ?, ?, ?)",
    [id, new Date(Date.now() + 3_600_000), randomUUID(), now, now, userId],
  );

  return id;
}

export async function readUserState(
  pool: TestDb,
  userId: string,
): Promise<{ isActive: number; sessions: number; auditRows: number }> {
  const [[userRow]] = await pool.execute<mysql.RowDataPacket[]>(
    "SELECT is_active FROM `user` WHERE id = ?",
    [userId],
  );
  const [[sessionRow]] = await pool.execute<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM `session` WHERE user_id = ?",
    [userId],
  );
  const [[auditRow]] = await pool.execute<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM audit_log WHERE target_id = ?",
    [userId],
  );

  return {
    isActive: userRow ? Number(userRow.is_active) : -1,
    sessions: Number(sessionRow.total),
    auditRows: Number(auditRow.total),
  };
}

export async function cleanupFixtureUsers(
  pool: TestDb,
  userIds: string[],
): Promise<void> {
  for (const userId of userIds) {
    await pool.execute(
      "DELETE FROM audit_log WHERE target_id = ? OR actor_user_id = ?",
      [userId, userId],
    );
    // Sessions, accounts and admin_user_roles cascade from the user row.
    await pool.execute("DELETE FROM `user` WHERE id = ?", [userId]);
  }
}

export async function deleteRateLimitKey(
  pool: TestDb,
  key: string,
): Promise<void> {
  await pool.execute("DELETE FROM `rate_limit` WHERE `key` = ?", [key]);
}

export async function closeTestPool(pool: TestDb): Promise<void> {
  await pool.end();
}
