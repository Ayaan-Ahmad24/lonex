
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

import * as schema from "./schema";

/**
 * Reusable CMS Database Connection
 *
 * Uses MySQL 8 and Drizzle ORM.
 *
 * Must only be imported by server-side code.
 */

// Read a required environment variable.
function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }

  return value;
}

// Validate the configured MySQL port.
function getDatabasePort(): number {
  const port = Number(getRequiredEnv("MYSQL_PORT"));

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error("Invalid MYSQL_PORT configuration.");
  }

  return port;
}

// MySQL connection pool type.
type MySQLPool = ReturnType<typeof mysql.createPool>;

// Cache the pool during development to avoid creating
// unnecessary connections during Next.js hot reloads.
const globalForDb = globalThis as typeof globalThis & {
  __cmsMySQLPool?: MySQLPool;
};

// Create or reuse the connection pool.
const pool =
  globalForDb.__cmsMySQLPool ??
  mysql.createPool({
    host: getRequiredEnv("MYSQL_HOST"),
    port: getDatabasePort(),
    user: getRequiredEnv("MYSQL_USER"),
    password: getRequiredEnv("MYSQL_PASSWORD"),
    database: getRequiredEnv("MYSQL_DATABASE"),

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

// Cache the pool only during development.
if (process.env.NODE_ENV !== "production") {
  globalForDb.__cmsMySQLPool = pool;
}

// Initialize Drizzle with our database schema.
export const db = drizzle({
  client: pool,
  schema,
  mode: "default",
});
