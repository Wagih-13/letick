import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function runMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST || "46.202.143.88",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "vercel_modestwear",
    password: process.env.DB_PASSWORD || "G!9r@T7m#Q2^wK8$Z1p*L4f%X5u",
    database: process.env.DB_NAME || "modestwear_db",
  });

  const db = drizzle(pool);

  try {
    console.log("🔄 Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations()
  .then(() => {
    console.log("✅ Migration process complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration process failed:", error);
    process.exit(1);
  });

