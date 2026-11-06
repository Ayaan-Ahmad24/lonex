import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeDbPool } from "@/db/client";
import {
  getSiteSettings,
  saveSiteSettings,
} from "@/admin/core/settings/service";
import {
  SETTINGS_KEY,
  siteSettingsSchema,
  type SiteSettings,
} from "@/admin/core/settings/schema";
import {
  cleanupFixtureUsers,
  closeTestPool,
  createFixtureUser,
  createTestPool,
  type TestDb,
} from "../helpers/db";

let pool: TestDb;
let actorId = "";
const createdUserIds: string[] = [];
let originalRow: { value_json: unknown; updated_by: string | null } | null = null;

const defaults: SiteSettings = siteSettingsSchema.parse({
  siteName: "Integration Site",
  tagline: "Testing",
  description: "Integration settings",
  logoText: "IS",
  logoMediaId: null,
  contactEmail: "hello@example.invalid",
  contactPhone: "",
  address: "",
  social: {
    facebook: "",
    instagram: "",
    x: "",
    linkedin: "",
    youtube: "",
  },
  seoTitle: "Integration title",
  seoDescription: "Integration description",
  noIndex: true,
});

beforeAll(async () => {
  pool = createTestPool();
  const actor = await createFixtureUser(pool, {
    role: "administrator",
    emailPrefix: "vitest-settings",
  });
  actorId = actor.id;
  createdUserIds.push(actorId);

  const [rows] = await pool.execute<import("mysql2").RowDataPacket[]>(
    "SELECT value_json, updated_by FROM site_settings WHERE `key` = ?",
    [SETTINGS_KEY],
  );

  originalRow = rows[0]
    ? { value_json: rows[0].value_json, updated_by: rows[0].updated_by }
    : null;

  await pool.execute("DELETE FROM site_settings WHERE `key` = ?", [SETTINGS_KEY]);
});

afterAll(async () => {
  await pool.execute("DELETE FROM site_settings WHERE `key` = ?", [SETTINGS_KEY]);

  if (originalRow) {
    await pool.execute(
      "INSERT INTO site_settings (`key`, value_json, updated_by) VALUES (?, ?, ?)",
      [SETTINGS_KEY, JSON.stringify(originalRow.value_json), originalRow.updated_by],
    );
  }

  await pool.execute("DELETE FROM audit_log WHERE action = 'settings.update'");
  await cleanupFixtureUsers(pool, createdUserIds);
  await closeTestPool(pool);
  await closeDbPool();
});

describe("site settings persistence", () => {
  it("returns deployment defaults when nothing is stored", async () => {
    expect(await getSiteSettings(defaults)).toEqual(defaults);
  });

  it("saves only changed keys and audits the field names", async () => {
    const result = await saveSiteSettings(actorId, defaults, {
      ...defaults,
      siteName: "Stored Site",
      contactEmail: "stored@example.invalid",
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.changedKeys.sort()).toEqual(["contactEmail", "siteName"]);

    const stored = await getSiteSettings(defaults);

    expect(stored.siteName).toBe("Stored Site");
    expect(stored.contactEmail).toBe("stored@example.invalid");
    expect(stored.tagline).toBe(defaults.tagline);

    const [[audit]] = await pool.execute<import("mysql2").RowDataPacket[]>(
      "SELECT actor_user_id, target_type, target_id, metadata FROM audit_log WHERE action = 'settings.update' ORDER BY id DESC LIMIT 1",
    );

    expect(audit.actor_user_id).toBe(actorId);
    expect(audit.target_type).toBe("settings");
    expect(audit.target_id).toBe(SETTINGS_KEY);

    const metadata =
      typeof audit.metadata === "string" ? JSON.parse(audit.metadata) : audit.metadata;

    expect(metadata.keys.sort()).toEqual(["contactEmail", "siteName"]);
    // Values, especially anything secret-looking, must not be copied.
    expect(JSON.stringify(metadata)).not.toContain("stored@example.invalid");
  });

  it("does not write or audit a no-op save", async () => {
    const before = await getSiteSettings(defaults);
    const result = await saveSiteSettings(actorId, defaults, before);

    expect(result).toEqual({ ok: true, changedKeys: [] });

    const [[row]] = await pool.execute<import("mysql2").RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM audit_log WHERE action = 'settings.update'",
    );

    expect(Number(row.total)).toBe(1);
  });

  it("ignores unknown keys already present in stored JSON", async () => {
    await pool.execute("UPDATE site_settings SET value_json = ? WHERE `key` = ?", [
      JSON.stringify({
        ...defaults,
        siteName: "Merged",
        databasePassword: "do-not-surface",
      }),
      SETTINGS_KEY,
    ]);

    const stored = await getSiteSettings(defaults) as SiteSettings &
      Record<string, unknown>;

    expect(stored.siteName).toBe("Merged");
    expect("databasePassword" in stored).toBe(false);
  });
});
