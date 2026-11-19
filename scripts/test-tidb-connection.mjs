import { createPool } from "mysql2/promise";
import { config } from "dotenv";

// Load credentials exclusively from .env.tidb (never from .env.local).
config({ path: ".env.tidb", quiet: true });

const required = ["TIDB_HOST", "TIDB_PORT", "TIDB_USER", "TIDB_PASSWORD", "TIDB_DATABASE"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  console.error("Create scripts/.env.tidb with TiDB Cloud credentials (never commit it).");
  process.exit(1);
}

const tidbConfig = {
  host: process.env.TIDB_HOST,
  port: Number(process.env.TIDB_PORT) || 4000,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,

  // TiDB Cloud requires TLS 1.2+ with certificate verification.
  ssl: {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
  },

  // 10-second connection timeout.
  connectTimeout: 10000,
};

// Mask credentials before any logging.
const safeConfig = {
  host: tidbConfig.host,
  port: tidbConfig.port,
  user: tidbConfig.user,
  database: tidbConfig.database,
  password: "***REDACTED***",
  ssl: tidbConfig.ssl,
  connectTimeout: tidbConfig.connectTimeout,
};

console.log("Attempting TiDB connection:");
console.log(JSON.stringify(safeConfig, null, 2));

let connection;

try {
  connection = await createPool(tidbConfig).getConnection();

  const [rows] = await connection.query(
    "SELECT VERSION() AS version, DATABASE() AS database_name, NOW() AS server_time"
  );

  console.log("TiDB connection successful.");
  console.log("Query result:");
  console.log(JSON.stringify(rows, null, 2));
} catch (error) {
  console.error("TiDB connection failed.");
  console.error(`Code: ${error.code ?? "UNKNOWN"}`);
  console.error(`Message: ${error.message ?? String(error)}`);
  process.exit(1);
} finally {
  if (connection) {
    try {
      await connection.release();
      console.log("Connection released.");
    } catch (releaseError) {
      console.error(`Error releasing connection: ${releaseError.message ?? String(releaseError)}`);
    }
  }

  // Exit cleanly so the mysql2 pool does not keep the process alive.
  process.exit(0);
}
