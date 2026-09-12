/**
 * Apply schema + seed to DATABASE_URL (local Docker or Railway/Render).
 *
 *   npm run db:seed
 *   npm run db:seed -- --force
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const initDir = path.resolve(__dirname, "../data/db/init");

function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy backend/.env.example to backend/.env (or set it on Railway/Render)."
    );
  }
  return url;
}

async function runSqlFile(client: pg.Client, fileName: string) {
  const fullPath = path.join(initDir, fileName);
  const sql = fs.readFileSync(fullPath, "utf8");
  console.log(`→ running ${fileName}`);
  await client.query(sql);
}

async function tableExists(client: pg.Client, table: string) {
  const result = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [table]
  );
  return result.rows[0]?.exists === true;
}

async function disputeCount(client: pg.Client) {
  if (!(await tableExists(client, "disputes"))) return 0;
  const result = await client.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM disputes"
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function forceReset(client: pg.Client) {
  console.log("→ --force: dropping public schema cascade");
  await client.query("DROP SCHEMA IF EXISTS public CASCADE");
  await client.query("CREATE SCHEMA public");
  await client.query("GRANT ALL ON SCHEMA public TO CURRENT_USER");
  await client.query("GRANT ALL ON SCHEMA public TO public");
}

async function main() {
  const force = process.argv.includes("--force");
  const client = new pg.Client({ connectionString: requireDatabaseUrl() });

  await client.connect();
  console.log("Connected to database.");

  try {
    if (force) {
      await forceReset(client);
    }

    if (!(await tableExists(client, "disputes"))) {
      await runSqlFile(client, "01_schema.sql");
    } else {
      console.log("→ schema already present");
    }

    const count = await disputeCount(client);
    if (count > 0) {
      console.log(
        `→ already seeded (${count} disputes). Use npm run db:seed -- --force to re-seed.`
      );
      return;
    }

    await runSqlFile(client, "02_seed.sql");
    console.log(`✓ seed complete (${await disputeCount(client)} disputes)`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("db:seed failed:", err);
  process.exit(1);
});
