import * as dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST ?? "46.202.143.88",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER ?? "vercel_modestwear",
    password: process.env.DB_PASSWORD ?? "'G!9r@T7m#Q2^wK8$Z1p*L4f%X5u'",
    database: process.env.DB_NAME ?? "modestwear_db",
  });

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL");

    const dbName = process.env.DB_NAME ?? "modestwear_db";

    // Check if database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

    if (res.rowCount && res.rowCount > 0) {
      console.log(`ℹ️  Database "${dbName}" already exists`);
    } else {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully`);
    }
  } catch (error) {
    console.error("❌ Error creating database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

createDatabase()
  .then(() => {
    console.log("✅ Database setup complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  });
