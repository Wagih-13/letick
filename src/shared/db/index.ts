import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";

import * as schema from "./schema";

// Load environment variables
dotenv.config();
const g = globalThis as any;

// TEMPORARY: Hardcoded connection for debugging
// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-explicit-any
const pool = g.__pgPool ?? new Pool({
  host: "46.202.143.88",
  port: 5432,
  user: "verce_letick",
  password: "xK9#mP2$vL7@nQ4!wR8^zT6&",
  database: "letick_db",
  max: 30,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 30000,
  keepAlive: true,
  application_name: "modestwear-app",
  ssl: false,
});

if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-underscore-dangle
  g.__pgPool = pool;
}

// Initialize Drizzle instance
// eslint-disable-next-line no-underscore-dangle
const _db = g.__drizzleDb ?? drizzle(pool, { schema });
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-underscore-dangle
  g.__drizzleDb = _db;
}
export const db = _db;

// Export schema for use in queries
export { schema };

// Health check function
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection() {
  await pool.end();
}