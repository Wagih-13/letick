import 'dotenv/config';
import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';

async function testDb() {
    try {
        console.log('Testing database connection with drizzle...');
        const result = await db.execute(sql`SELECT NOW() as now, current_database() as db, current_user as "user"`);
        console.log('✅ Connected successfully!');
        console.log('Result:', result);

        // Check for product_reviews table
        const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_reviews'
      ) as exists
    `);
        console.log('product_reviews table exists:', tableCheck.rows[0].exists);

        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error);
        process.exit(1);
    }
}

testDb();
