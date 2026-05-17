import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testQueries() {
  const userId = '00000000-0000-0000-0000-000000000000'; // dummy uuid
  try {
    console.log("Testing getDailyProgress queries...");
    await pool.query(`SELECT SUM(protein_grams) FROM protein_logs WHERE user_id = $1`, [userId]);
    await pool.query(`SELECT id FROM gym_logs WHERE user_id = $1 LIMIT 1`, [userId]);
    await pool.query(`SELECT daily_protein_goal FROM users WHERE id = $1`, [userId]);
    
    console.log("Testing insert queries...");
    // we won't actually insert, we can explain
    await pool.query(`EXPLAIN INSERT INTO protein_logs (user_id, meal_name, protein_grams, date) VALUES ($1, $2, $3, CURRENT_DATE)`, [userId, 'test', 10]);
    await pool.query(`EXPLAIN INSERT INTO gym_logs (user_id, workout_completed, notes, date) VALUES ($1, true, $2, CURRENT_DATE)`, [userId, '']);
    
    console.log("All app queries passed!");
  } catch(e) {
    console.error("App query failed:", e.message);
  } finally {
    await pool.end();
  }
}
testQueries();
