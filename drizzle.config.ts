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
    user: process.env.DB_USER || "wagih",
    password: process.env.DB_PASSWORD || "AlAl@!@!12!@",
    database: process.env.DB_NAME || "modestwear_db",
    ssl: false,
  },
  verbose: true,
  strict: true,
} satisfies Config;
