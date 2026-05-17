import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    const tables = ['users', 'accounts', 'sessions', 'protein_logs', 'gym_logs', 'subscriptions'];
    for (const table of tables) {
      console.log(`\nColumns in ${table}:`);
      const res = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${table}';
      `);
      console.log(res.rows.map(r => r.column_name).join(', '));
    }
  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
test();
