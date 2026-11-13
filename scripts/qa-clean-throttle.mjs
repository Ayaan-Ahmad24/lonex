// Step 8 QA helper: clear verification throttle counters between capture runs.
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: ".env.local", quiet: true });

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

const [result] = await connection.query(
  "DELETE FROM `rate_limit` WHERE `key` LIKE 'verify:%'",
);

console.log(`cleared ${result.affectedRows} verification throttle rows`);
await connection.end();
