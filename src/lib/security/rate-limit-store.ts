import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimit } from "@/db/schema";

/**
 * Counter storage shared by the sign-in, upload and verification throttles.
 *
 * All three throttles use the existing `rate_limit` table, so the read, the
 * windowed increment and the reset live here once. Callers own their key
 * shape, window and limit; this module only owns the SQL.
 */

export type CounterState = {
  count: number;
  withinWindow: boolean;
};

export async function readCounter(
  key: string,
  windowSeconds: number,
  now: number = Date.now(),
): Promise<CounterState> {
  const [row] = await db
    .select({
      count: rateLimit.count,
      lastRequest: rateLimit.lastRequest,
    })
    .from(rateLimit)
    .where(sql`${rateLimit.key} = ${key}`)
    .limit(1);

  if (!row) {
    return { count: 0, withinWindow: false };
  }

  return {
    count: Number(row.count),
    withinWindow: now - Number(row.lastRequest) < windowSeconds * 1000,
  };
}

/**
 * Increment a counter, starting a fresh window when the previous request is
 * older than `windowSeconds`. The single statement keeps concurrent attempts
 * from losing an increment.
 */
export async function incrementCounter(
  key: string,
  windowSeconds: number,
  now: number = Date.now(),
): Promise<void> {
  const windowStart = now - windowSeconds * 1000;

  await db.execute(sql`
    INSERT INTO \`rate_limit\` (\`id\`, \`key\`, \`count\`, \`last_request\`)
    VALUES (${randomUUID()}, ${key}, 1, ${now})
    ON DUPLICATE KEY UPDATE
      \`count\` = IF(\`last_request\` < ${windowStart}, 1, \`count\` + 1),
      \`last_request\` = ${now}
  `);
}

export async function clearCounter(key: string): Promise<void> {
  await db.execute(sql`DELETE FROM \`rate_limit\` WHERE \`key\` = ${key}`);
}

export async function clearCounters(keys: string[]): Promise<void> {
  for (const key of keys) {
    await clearCounter(key);
  }
}
