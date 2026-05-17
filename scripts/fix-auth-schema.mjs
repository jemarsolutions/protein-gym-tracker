import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixSchema() {
  console.log('Fixing schema for Auth.js adapter...');
  try {
    // Auth.js strictly expects camelCase column names for its internal queries
    await pool.query(`
      ALTER TABLE accounts RENAME COLUMN user_id TO "userId";
      ALTER TABLE accounts RENAME COLUMN provider_account_id TO "providerAccountId";
      ALTER TABLE sessions RENAME COLUMN user_id TO "userId";
      ALTER TABLE sessions RENAME COLUMN session_token TO "sessionToken";
      ALTER TABLE users RENAME COLUMN email_verified TO "emailVerified";
    `);
    console.log('✅ Auth.js Schema fixed! Columns renamed to camelCase.');
  } catch (err) {
    // Ignore errors if the columns were already renamed
    if (err.message.includes("does not exist")) {
        console.log('Columns might already be renamed. Check database.');
    } else {
        console.error('Error fixing schema:', err.message);
    }
  } finally {
    await pool.end();
  }
}
fixSchema();
