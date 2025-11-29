import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/shared/db/schema/index.ts", // ✅ المكان الصح
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: "46.202.143.88",
    port: 5432,
    user: "vercel_modestwear",
    password: "G!9r@T7m#Q2^wK8$Z1p*L4f%X5u",
    database: "modestwear_db",
    ssl: false,
  },
  verbose: true,
  strict: true,
});