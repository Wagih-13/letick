import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// بناء connection string من المتغيرات
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// إنشاء postgres client
const client = postgres(connectionString, {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? 'prefer' : false,
    max: 20, // maximum connections
    idle_timeout: 30,
    connect_timeout: 10,
    onnotice: () => { }, // تجاهل الـ notices
});

// إنشاء drizzle instance
export const db = drizzle(client);

// دالة لاختبار الاتصال
export async function testConnection() {
    try {
        const result = await client`SELECT NOW() as now, current_database() as db, current_user as user`;
        console.log('✅ Database connected:', {
            time: result[0].now,
            database: result[0].db,
            user: result[0].user
        });
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

// Export للاستخدام في الكود
export { client };
export default db;