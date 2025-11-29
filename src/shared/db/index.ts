import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";

import * as schema from "./schema";

// Load environment variables
dotenv.config();

// Create PostgreSQL connection pool
const hasConnStr = !!process.env.DATABASE_URL;
const sslEnv = String(process.env.DB_SSL || process.env.PGSSLMODE || "").toLowerCase();
const sslRequired = sslEnv === "true" || sslEnv === "require" || (process.env.DATABASE_URL?.includes("sslmode=require") ?? false);

const pool = new Pool(
  hasConnStr
    ? {
      connectionString: process.env.DATABASE_URL,
      max: 30, // Increased from 20 for better concurrency
      idleTimeoutMillis: 60000, // Increased to 60s for better connection reuse
      connectionTimeoutMillis: 2000,
      statement_timeout: 30000, // 30s query timeout
      ssl: sslRequired ? { rejectUnauthorized: false } : false,
    }
    : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "vercel_modestwear",
      password: process.env.DB_PASSWORD || "G!9r@T7m#Q2^wK8$Z1p*L4f%X5u",
      database: process.env.DB_NAME || "modestwear_db",
      max: 30, // Increased from 20 for better concurrency
      idleTimeoutMillis: 60000, // Increased to 60s for better connection reuse
      connectionTimeoutMillis: 2000,
      statement_timeout: 30000, // 30s query timeout
      ssl: sslRequired ? { rejectUnauthorized: false } : false,
    },
);

// Initialize Drizzle instance
export const db = drizzle(pool, { schema });

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
