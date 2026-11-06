import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import {
  mergeSettings,
  SETTINGS_KEY,
  type SiteSettings,
} from "./schema";

export type SettingsSaveResult =
  | { ok: true; changedKeys: string[] }
  | { ok: false; message: string };

function changedKeys(
  previous: SiteSettings,
  next: SiteSettings,
): string[] {
  const keys: string[] = [];

  for (const key of Object.keys(next) as (keyof SiteSettings)[]) {
    if (JSON.stringify(previous[key]) !== JSON.stringify(next[key])) {
      keys.push(key);
    }
  }

  return keys;
}

export async function getSiteSettings(
  defaults: SiteSettings,
): Promise<SiteSettings> {
  const [row] = await db
    .select({ valueJson: siteSettings.valueJson })
    .from(siteSettings)
    .where(eq(siteSettings.key, SETTINGS_KEY))
    .limit(1);

  return row ? mergeSettings(defaults, row.valueJson) : defaults;
}

/**
 * Upsert the single settings row and write an audit event in the same
 * transaction. Only changed keys are recorded; values are not duplicated into
 * the audit log.
 */
export async function saveSiteSettings(
  actorUserId: string,
  defaults: SiteSettings,
  next: SiteSettings,
): Promise<SettingsSaveResult> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({ valueJson: siteSettings.valueJson })
      .from(siteSettings)
      .where(eq(siteSettings.key, SETTINGS_KEY))
      .limit(1);

    const previous = row ? mergeSettings(defaults, row.valueJson) : defaults;
    const keys = changedKeys(previous, next);

    if (keys.length === 0) {
      return { ok: true as const, changedKeys: [] };
    }

    await tx
      .insert(siteSettings)
      .values({
        key: SETTINGS_KEY,
        valueJson: next as unknown as Record<string, unknown>,
        updatedBy: actorUserId,
      })
      .onDuplicateKeyUpdate({
        set: {
          valueJson: next as unknown as Record<string, unknown>,
          updatedBy: actorUserId,
        },
      });

    await recordAudit(tx, {
      actorUserId,
      action: "settings.update",
      targetType: "settings",
      targetId: SETTINGS_KEY,
      metadata: { keys },
    });

    return { ok: true as const, changedKeys: keys };
  });
}
