-- Migration: Add user ownership to books table
-- Generated: 2026-03-21
-- Description: Adds user_id column to book table for multi-user book ownership

-- Step 0: Create User table if it doesn't exist
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password text NOT NULL
);

-- Step 1: Add user_id column to book table (nullable first for migration)
ALTER TABLE "book" ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES "User"("id") ON DELETE CASCADE;

-- Step 2: Create index for efficient lookups by user_id
CREATE INDEX IF NOT EXISTS "book_user_id_idx" ON "book" ("user_id");
