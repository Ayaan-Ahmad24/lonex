// Temporary QA fixture for the seller directory layout. Inserts two clearly
// labelled test rows, and can remove them again with `node scripts/qa-sellers-fixture.mjs remove`.
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

const remove = process.argv.includes("remove");

if (remove) {
  const [result] = await connection.query(
    "DELETE FROM `authorized_sellers` WHERE `name` LIKE 'QA TEST%'",
  );
  console.log(`removed ${result.affectedRows} QA rows`);
} else {
  await connection.query(
    `INSERT INTO \`authorized_sellers\`
       (\`name\`, \`city\`, \`address\`, \`phone\`, \`whatsapp\`, \`google_maps_url\`, \`sort_order\`, \`status\`)
     VALUES
       ('QA TEST North', 'Lahore', '12 Test Avenue, Gulberg III, Lahore', '0300 000 0001', '923000000001', 'https://maps.google.com/', 1, 'active'),
       ('QA TEST South', 'Karachi', '48 Test Road, Clifton Block 5, Karachi', '0300 000 0002', NULL, NULL, 2, 'active')`,
  );
  console.log("inserted 2 QA rows");
}

await connection.end();
