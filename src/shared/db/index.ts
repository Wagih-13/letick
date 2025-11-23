import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";

import * as schema from "./schema";

// Load environment variables
dotenv.config();

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Yarasara+ahmed",
  database: process.env.DB_NAME || "nextecom_db",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
   connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false // مهم جداً!
  }
});

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
