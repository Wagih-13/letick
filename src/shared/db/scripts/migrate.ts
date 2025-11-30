import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

dotenv.config();

async function runMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST ?? "46.202.143.88",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER ?? "verce_letick",
    password: process.env.DB_PASSWORD ?? "'xK9#mP2$vL7@nQ4!wR8^zT6&'",
    database: process.env.DB_NAME ?? "letick_db",
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
