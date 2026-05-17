import { Pool } from '@neondatabase/serverless';

// Ensure the connection string uses the pooled connection URL
// Example: postgres://[user]:[password]@[endpoint]-pooler.neon.tech/[dbname]?sslmode=require
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
