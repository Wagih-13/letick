import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";

import * as schema from "./schema";

// Load environment variables
dotenv.config();
const g = globalThis as any;

// Create PostgreSQL connection pool
const hasConnStr = !!process.env.DATABASE_URL;
const preferHostConfig = String(process.env.DB_FORCE_HOST_CONFIG || process.env.DB_PREFER_HOST_CONFIG || "").toLowerCase() === "true";
const sslEnv = String(process.env.DB_SSL || process.env.PGSSLMODE || "").toLowerCase();
const sslRequired = sslEnv === "true" || sslEnv === "require" || (process.env.DATABASE_URL?.includes("sslmode=require") ?? false);

const pool = g.__pgPool ?? new Pool(
  hasConnStr && !preferHostConfig
    ? {
      connectionString: process.env.DATABASE_URL,
      max: 30, // Increased from 20 for better concurrency
      idleTimeoutMillis: 60000, // Increased to 60s for better connection reuse
      connectionTimeoutMillis: 10000,
      statement_timeout: 30000, // 30s query timeout
      keepAlive: true,
      application_name: process.env.PG_APP_NAME || "modestwear-app",
      ssl: sslRequired ? { rejectUnauthorized: false } : false,
    }
    : {
      host: process.env.DB_HOST || "46.202.143.88",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "vercel_modestwear",
      password: process.env.DB_PASSWORD || "G!9r@T7m#Q2^wK8$Z1p*L4f%X5u",
      database: process.env.DB_NAME || "modestwear_db",
      max: 30, // Increased from 20 for better concurrency
      idleTimeoutMillis: 60000, // Increased to 60s for better connection reuse
      connectionTimeoutMillis: 10000,
      statement_timeout: 30000, // 30s query timeout
      keepAlive: true,
      application_name: process.env.PG_APP_NAME || "modestwear-app",
      ssl: sslRequired ? { rejectUnauthorized: false } : false,
    },
);

if (process.env.NODE_ENV !== "production") g.__pgPool = pool;

// Initialize Drizzle instance
const _db = g.__drizzleDb ?? drizzle(pool, { schema });
if (process.env.NODE_ENV !== "production") g.__drizzleDb = _db;
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
