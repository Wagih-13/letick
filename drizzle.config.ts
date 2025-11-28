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
    user: process.env.DB_USER || "vercel_modestwear",
    password: process.env.DB_PASSWORD || "G!9r@T7m#Q2^wK8$Z1p*L4f%X5u",
    database: process.env.DB_NAME || "modestwear_db",
    ssl: false,
  },
  verbose: true,
  strict: true,
} satisfies Config;
