import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export default {
  schema: "./src/shared/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "Yarasara+ahmed",
    database: process.env.DB_NAME || "nextecom_db",
    ssl: false,
  },
  verbose: true,
  strict: true,
} satisfies Config;
