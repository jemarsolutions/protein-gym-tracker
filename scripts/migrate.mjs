import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();

// Initialize pool using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  console.log('🚀 Starting Neon DB migration...');
  
  try {
    await pool.query(`
      create table if not exists users (
        id uuid default gen_random_uuid() primary key,
        name text,
        email text unique,
        email_verified timestamp,
        image text,
        daily_protein_goal integer default 150,
        is_premium boolean default false
      );

      create table if not exists accounts (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references users(id) on delete cascade not null,
        type text not null,
        provider text not null,
        provider_account_id text not null,
        refresh_token text,
        access_token text,
        expires_at integer,
        token_type text,
        scope text,
        id_token text,
        session_state text,
        UNIQUE(provider, provider_account_id)
      );

      create table if not exists sessions (
        id uuid default gen_random_uuid() primary key,
        session_token text unique not null,
        user_id uuid references users(id) on delete cascade not null,
        expires timestamp not null
      );

      create table if not exists verification_token (
        identifier text,
        token text,
        expires timestamp not null,
        primary key (identifier, token)
      );

      create table if not exists gym_logs (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references users(id) on delete cascade not null,
        date date default current_date not null,
        workout_completed boolean default true,
        notes text,
        created_at timestamp default current_timestamp not null
      );

      create table if not exists protein_logs (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references users(id) on delete cascade not null,
        date date default current_date not null,
        meal_name text not null,
        protein_grams integer not null,
        created_at timestamp default current_timestamp not null
      );

      create table if not exists subscriptions (
        id text primary key,
        user_id uuid references users(id) on delete cascade not null,
        status text,
        price_id text,
        current_period_end timestamp
      );
    `);
    console.log('✅ Migration successful! All tables have been created securely.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close connection pool to exit script cleanly
    await pool.end();
  }
}

migrate();
