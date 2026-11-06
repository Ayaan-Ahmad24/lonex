import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

import * as schema from "./schema";
import { getServerEnv } from "../lib/env";

/**
 * Reusable CMS database connection (no server-only marker).
 *
 * Kept separate from src/db/index.ts so local CLI scripts can reuse the
 * connection while Next.js still marks the public entry point server-only.
 */

type MySQLPool = ReturnType<typeof mysql.createPool>;

const globalForDb = globalThis as typeof globalThis & {
  __cmsMySQLPool?: MySQLPool;
};

function createPool(): MySQLPool {
  const env = getServerEnv();

  return mysql.createPool({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
}

const pool = globalForDb.__cmsMySQLPool ?? createPool();

// Cache the pool only during development to survive Next.js hot reloads.
if (process.env.NODE_ENV !== "production") {
  globalForDb.__cmsMySQLPool = pool;
}

export const db = drizzle({
  client: pool,
  schema,
  mode: "default",
});

/** Test/CLI shutdown helper. The Next.js process never calls this. */
export async function closeDbPool(): Promise<void> {
  await pool.end();
  globalForDb.__cmsMySQLPool = undefined;
}
