import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/shared/db/schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = postgres({
    host: process.env.DB_HOST || '46.202.143.88',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'vercel_modestwear',
    password: process.env.DB_PASSWORD || 'G!9r@T7m#Q2^wK8$Z1p*L4f%X5u',
    database: process.env.DB_NAME || 'modestwear_db',
    ssl: false,
    max: 20,
});

export const db = drizzle(client, { schema });
export { client };
export default db;