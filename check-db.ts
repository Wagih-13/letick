import 'dotenv/config';
import 'dotenv/config';
import postgres from 'postgres';

const connectionString = `postgresql://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD || '')}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const client = postgres(connectionString, {
    ssl: false,
    max: 1,
});

async function check() {
    try {
        console.log('Testing connection...');
        const now = await client`SELECT NOW()`;
        console.log('Connected:', now);

        console.log('Checking for product_reviews table...');
        const result = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_reviews'
      );
    `;
        console.log('Table exists:', result[0].exists);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
