import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/shared/db/schema";

// Load environment variables
dotenv.config();

const client = postgres({
  host: process.env.DB_HOST ?? "46.202.143.88",
  port: parseInt(process.env.DB_PORT ?? "5432"),
  username: process.env.DB_USER ?? "verce_letick",
  password: process.env.DB_PASSWORD ?? '"xK9#mP2$vL7@nQ4!wR8^zT6&"',
  database: process.env.DB_NAME ?? "letick_db",
  ssl: false,
  max: 20,
});

export const db = drizzle(client, { schema });
export { client };
export default db;
