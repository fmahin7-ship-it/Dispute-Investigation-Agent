import pg from "pg";
import { env } from "../config/env.js";

let pool: pg.Pool | null = null;

/** Shared Postgres pool — ops source of truth. */
export function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: env.databaseUrl,
      max: 10,
    });
  }
  return pool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return getPool().query<T>(text, params);
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export function getDbStatus() {
  return {
    driver: "postgres",
    pool: pool ? "open" : "lazy",
  };
}
