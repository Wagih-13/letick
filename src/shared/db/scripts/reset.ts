import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function resetDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: "postgres",
  });

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL");

    const dbName = process.env.DB_NAME || "nextecom_db";

    console.log("🔄 Resetting database...");

    // Terminate connections
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid()
    `, [dbName]);

    // Drop and recreate
    await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log(`✅ Dropped database "${dbName}"`);

    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Created database "${dbName}"`);

    console.log("✅ Database reset successfully");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

resetDatabase()
  .then(() => {
    console.log("✅ Database reset complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Database reset failed:", error);
    process.exit(1);
  });
