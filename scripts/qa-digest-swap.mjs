// Step 8 QA helper: install the temporary QA digest on verification code row
// 12, or restore the original. The raw code is never stored by the app; this
// only swaps the keyed digest for a capture window and restores it afterwards.
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

const ORIGINAL =
  "8c727f58d8b42bb6fedfc755bc4e9e02990fd47400b69e8168d5ab3803ac8819";
const QA =
  "2fa468b451910b8edc33a888b6991f915a6f8d9ae6a647d64b2ac75e74959aa6";

const restore = process.argv.includes("restore");

await connection.query(
  "UPDATE `product_verification_codes` SET `code_digest` = ? WHERE `id` = 12",
  [restore ? ORIGINAL : QA],
);

const [rows] = await connection.query(
  "SELECT `id`, `code_digest`, `active` FROM `product_verification_codes` WHERE `id` = 12",
);

console.log(restore ? "restored original digest" : "installed QA digest", rows[0]);
await connection.end();
