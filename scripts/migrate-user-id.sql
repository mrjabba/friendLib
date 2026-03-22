-- Drop the foreign key constraint that references the old User table
ALTER TABLE book DROP CONSTRAINT IF EXISTS book_user_id_fkey;

-- Now change the column type
ALTER TABLE book ALTER COLUMN user_id TYPE text;

-- Verify
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'book' AND column_name = 'user_id';
