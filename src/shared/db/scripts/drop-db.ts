import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function dropDatabase() {
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

    // Terminate all connections to the database
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid()
    `, [dbName]);

    // Drop database
    await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log(`✅ Database "${dbName}" dropped successfully`);
  } catch (error) {
    console.error("❌ Error dropping database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

dropDatabase()
  .then(() => {
    console.log("✅ Database drop complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Database drop failed:", error);
    process.exit(1);
  });
