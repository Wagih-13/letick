import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/shared/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: "46.202.143.88",
    port: 5432,
    user: "verce_letick",
    password: "xK9#mP2$vL7@nQ4!wR8^zT6&", // ثابت بدون process.env
    database: "letick_db",
    ssl: false,
  },
  verbose: true,
  strict: true,
});