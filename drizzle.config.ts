import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/shared/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: "46.202.143.88",
    port: 5432,
    user: "vercel_modestwear",
    password: "S8v#Q2r!X5u^L9p@F1z", // ثابت بدون process.env
    database: "modestwear_db",
    ssl: false,
  },
  verbose: true,
  strict: true,
});