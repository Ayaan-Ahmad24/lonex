import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import mysql from "mysql2/promise";
import { hashPassword } from "better-auth/crypto";

config({ path: ".env.local", quiet: true });

export const FIXTURE_FILE = path.join(
  process.cwd(),
  "tests",
  "e2e",
  ".fixtures.json",
);

export type E2eUser = {
  id: string;
  email: string;
  password: string;
  role: "administrator" | "editor";
};

export type E2eFixtures = {
  startedAt: number;
  admin: E2eUser;
  editor: E2eUser;
  inactive: E2eUser;
  target: E2eUser;
  targetSessionId: string;
  /** Snapshot of the editable site settings row before the run. */
  settingsBackup: { value: unknown; updatedBy: string | null } | null;
};

function pool() {
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

async function roleId(
  db: mysql.Pool,
  slug: "administrator" | "editor",
): Promise<number> {
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    "SELECT id FROM admin_roles WHERE slug = ? LIMIT 1",
    [slug],
  );

  if (rows.length === 0) {
    throw new Error(`Seed role "${slug}" is missing.`);
  }

  return Number(rows[0].id);
}

async function insertUser(
  db: mysql.Pool,
  user: E2eUser,
  options: { isActive: boolean },
): Promise<void> {
  const now = new Date();
  const role = await roleId(db, user.role);
  const passwordHash = await hashPassword(user.password);

  await db.execute(
    "INSERT INTO `user` (id, name, email, email_verified, created_at, updated_at, is_active) VALUES (?, ?, ?, 1, ?, ?, ?)",
    [user.id, "E2E Fixture", user.email, now, now, options.isActive ? 1 : 0],
  );
  await db.execute(
    "INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES (?, ?, 'credential', ?, ?, ?, ?)",
    [randomUUID(), user.id, user.id, passwordHash, now, now],
  );
  await db.execute(
    "INSERT INTO admin_user_roles (user_id, role_id) VALUES (?, ?)",
    [user.id, role],
  );
}

function makeUser(role: E2eUser["role"], prefix: string): E2eUser {
  const password = `E2e-${randomUUID()}-Password!`;

  return {
    id: randomUUID(),
    email: `${prefix}-${randomUUID()}@example.invalid`,
    password,
    role,
  };
}

/**
 * Create one extra throwaway account inside a test. Used by destructive tests
 * that must not remove the shared `target` fixture other specs depend on.
 */
export async function createExtraUser(
  prefix: string,
  role: E2eUser["role"] = "editor",
): Promise<E2eUser> {
  const db = pool();
  const user = makeUser(role, prefix);

  try {
    await insertUser(db, user, { isActive: true });
    return user;
  } finally {
    await db.end();
  }
}

/** Remove an extra test account and its audit rows (no-op if already gone). */
export async function removeExtraUser(id: string): Promise<void> {
  const db = pool();

  try {
    await db.execute(
      "DELETE FROM audit_log WHERE target_id = ? OR actor_user_id = ?",
      [id, id],
    );
    await db.execute("DELETE FROM `user` WHERE id = ?", [id]);
  } finally {
    await db.end();
  }
}

export type E2eProduct = { id: number; name: string; slug: string };

/**
 * Create a throwaway draft product in the solar category.
 *
 * Used by verification tests that need a model with no registered code; the
 * seeded products must keep their real codes untouched.
 */
export async function createVerificationProduct(
  prefix: string,
): Promise<E2eProduct> {
  const db = pool();
  const slug = `${prefix}-${randomUUID()}`;
  const name = `E2E Verify ${slug.slice(-8).toUpperCase()}`;

  try {
    const [categories] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT id FROM categories WHERE slug = 'solar' LIMIT 1",
    );

    if (categories.length === 0) {
      throw new Error('Seed category "solar" is missing.');
    }

    const [result] = await db.execute<mysql.ResultSetHeader>(
      "INSERT INTO products (category_id, name, slug, status) VALUES (?, ?, ?, 'draft')",
      [Number(categories[0].id), name, slug],
    );

    return { id: Number(result.insertId), name, slug };
  } finally {
    await db.end();
  }
}

/** Remove a throwaway verification product and any audit rows it produced. */
export async function removeVerificationProduct(id: number): Promise<void> {
  const db = pool();

  try {
    await db.execute("DELETE FROM audit_log WHERE target_id = ?", [String(id)]);
    // product_verification_codes cascades from products.
    await db.execute("DELETE FROM products WHERE id = ?", [id]);
  } finally {
    await db.end();
  }
}

export async function createFixtures(): Promise<E2eFixtures> {
  const db = pool();
  const startedAt = Date.now();

  const fixtures: E2eFixtures = {
    startedAt,
    admin: makeUser("administrator", "e2e-admin"),
    editor: makeUser("editor", "e2e-editor"),
    inactive: makeUser("editor", "e2e-inactive"),
    target: makeUser("editor", "e2e-target"),
    targetSessionId: randomUUID(),
    settingsBackup: null,
  };

  try {
    await insertUser(db, fixtures.admin, { isActive: true });
    await insertUser(db, fixtures.editor, { isActive: true });
    await insertUser(db, fixtures.inactive, { isActive: false });
    await insertUser(db, fixtures.target, { isActive: true });

    const [settingRows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT value_json, updated_by FROM site_settings WHERE `key` = 'site'",
    );

    fixtures.settingsBackup = settingRows[0]
      ? {
          value: settingRows[0].value_json,
          updatedBy: settingRows[0].updated_by ?? null,
        }
      : null;

    const now = new Date();
    await db.execute(
      "INSERT INTO `session` (id, expires_at, token, created_at, updated_at, user_id) VALUES (?, ?, ?, ?, ?, ?)",
      [
        fixtures.targetSessionId,
        new Date(Date.now() + 3_600_000),
        randomUUID(),
        now,
        now,
        fixtures.target.id,
      ],
    );

    writeFileSync(FIXTURE_FILE, JSON.stringify(fixtures, null, 2), "utf8");

    return fixtures;
  } finally {
    await db.end();
  }
}

export async function destroyFixtures(): Promise<void> {
  if (!existsSync(FIXTURE_FILE)) {
    return;
  }

  const fixtures = JSON.parse(
    readFileSync(FIXTURE_FILE, "utf8"),
  ) as E2eFixtures;
  const db = pool();
  const ids = [
    fixtures.admin.id,
    fixtures.editor.id,
    fixtures.inactive.id,
    fixtures.target.id,
  ];

  try {
    // Remove only synthetic E2E content created with the `e2e-` prefix.
    await db.execute("DELETE FROM site_settings WHERE `key` = 'site'");

    if (fixtures.settingsBackup) {
      await db.execute(
        "INSERT INTO site_settings (`key`, value_json, updated_by) VALUES ('site', ?, ?)",
        [
          JSON.stringify(fixtures.settingsBackup.value),
          fixtures.settingsBackup.updatedBy,
        ],
      );
    }

    const [mediaRows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT id, storage_key FROM media_assets WHERE original_name LIKE 'e2e-%'",
    );
    const mediaRoot = path.resolve(
      process.cwd(),
      process.env.MEDIA_STORAGE_PATH ?? ".data/media",
    );

    for (const row of mediaRows) {
      const full = path.join(mediaRoot, String(row.storage_key));

      if (existsSync(full)) {
        unlinkSync(full);
      }
    }

    if (mediaRows.length > 0) {
      const placeholders = mediaRows.map(() => "?").join(",");
      await db.execute(
        `DELETE FROM media_assets WHERE id IN (${placeholders})`,
        mediaRows.map((row) => row.id),
      );
    }

    await db.execute(
      "DELETE FROM audit_log WHERE target_type IN ('page', 'media', 'settings') AND actor_user_id IS NOT NULL AND actor_user_id IN (?, ?, ?, ?)",
      ids,
    );

    for (const id of ids) {
      await db.execute(
        "DELETE FROM audit_log WHERE target_id = ? OR actor_user_id = ?",
        [id, id],
      );
    }

    for (const id of ids) {
      await db.execute("DELETE FROM `user` WHERE id = ?", [id]);
    }

    // Remove counters created during this run only.
    await db.execute(
      "DELETE FROM `rate_limit` WHERE `last_request` >= ? AND (`key` LIKE 'acct-login:%' OR `key` LIKE '%|/sign-in/email' OR `key` LIKE '%|/sign-out')",
      [fixtures.startedAt],
    );
  } finally {
    await db.end();
    rmSync(FIXTURE_FILE, { force: true });
  }
}
