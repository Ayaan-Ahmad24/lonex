
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local development environment variables.
config({ path: ".env.local", quiet: true });

// Require environment variables without exposing secrets.
function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

// Validate the MySQL port.
const port = Number(getEnv("MYSQL_PORT"));

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("MYSQL_PORT must be a valid port number.");
}

export default defineConfig({
  dialect: "mysql",

  // Main schema entry point.
  schema: "./src/db/schema.ts",

  // Generated SQL migrations.
  out: "./drizzle",

  dbCredentials: {
    host: getEnv("MYSQL_HOST"),
    port,
    user: getEnv("MYSQL_USER"),
    password: getEnv("MYSQL_PASSWORD"),
    database: getEnv("MYSQL_DATABASE"),
  },

  verbose: true,
  strict: true,
});
