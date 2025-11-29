import 'dotenv/config';
import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';
import { productReviews, users, products } from './src/shared/db/schema';

async function testQuery() {
    try {
        console.log('Testing product_reviews query...');

        // Test 1: Check if table exists and is accessible
        const tableTest = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'product_reviews'
      LIMIT 5
    `);
        console.log('✅ product_reviews table columns:', tableTest.rows);

        // Test 2: Try to count rows
        const countTest = await db.execute(sql`SELECT COUNT(*) as count FROM product_reviews`);
        console.log('✅ product_reviews row count:', countTest.rows[0]);

        // Test 3: Try the actual failing query with simpler version
        const reviewTest = await db.execute(sql`
      SELECT id, rating, is_approved 
      FROM product_reviews 
      WHERE is_approved = true 
      LIMIT 2
    `);
        console.log('✅ Approved reviews:', reviewTest.rows);

        process.exit(0);
    } catch (error) {
        console.error('❌ Query failed:', error);
        process.exit(1);
    }
}

testQuery();
