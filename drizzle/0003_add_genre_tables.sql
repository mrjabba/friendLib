-- Migration: Add genre and book_genre tables for multi-genre support
-- Generated: 2026-03-21
-- Description: Implements many-to-many relationship between books and genres

-- Step 1: Create genre table
CREATE TABLE IF NOT EXISTS "genre" (
    "id" serial PRIMARY KEY NOT NULL,
    "value" text NOT NULL UNIQUE
);

-- Step 2: Create book_genre join table
CREATE TABLE IF NOT EXISTS "book_genre" (
    "book_id" integer NOT NULL REFERENCES "book"("id") ON DELETE CASCADE,
    "genre_id" integer NOT NULL REFERENCES "genre"("id") ON DELETE CASCADE,
    PRIMARY KEY ("book_id", "genre_id")
);

-- Step 3: Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS "book_genre_book_id_idx" ON "book_genre" ("book_id");
CREATE INDEX IF NOT EXISTS "book_genre_genre_id_idx" ON "book_genre" ("genre_id");

-- Step 4: Insert initial genres
INSERT INTO "genre" ("value") VALUES
    ('Fiction'),
    ('Non-Fiction'),
    ('Mystery'),
    ('Science Fiction'),
    ('Fantasy'),
    ('Romance'),
    ('Thriller'),
    ('Horror'),
    ('Biography'),
    ('History'),
    ('Self-Help'),
    ('Business'),
    ('Children'),
    ('Young Adult'),
    ('Poetry'),
    ('Drama')
ON CONFLICT ("value") DO NOTHING;

-- Step 5: Migrate existing book genres from comma-separated format
-- This script handles books that have genres stored as "Fiction,Science Fiction" etc.
DO $$
DECLARE
    book_record RECORD;
    genre_name TEXT;
    genre_id_val INTEGER;
BEGIN
    -- Only process if old genres field exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'book' AND column_name = 'genres') THEN
        
        FOR book_record IN 
            SELECT id, genres FROM book 
            WHERE genres IS NOT NULL AND genres != '' AND genres != '[]'
        LOOP
            -- Split by comma and process each genre
            FOREACH genre_name IN ARRAY string_to_array(book_record.genres, ',')
            LOOP
                -- Trim whitespace
                genre_name := trim(genre_name);
                
                -- Skip empty strings
                IF genre_name = '' THEN
                    CONTINUE;
                END IF;
                
                -- Try to find existing genre
                SELECT id INTO genre_id_val FROM genre WHERE value = genre_name;
                
                IF genre_id_val IS NULL THEN
                    -- Create new genre if it doesn't exist
                    INSERT INTO genre (value) VALUES (genre_name) 
                    RETURNING id INTO genre_id_val;
                END IF;
                
                -- Create book-genre relationship
                INSERT INTO book_genre (book_id, genre_id) 
                VALUES (book_record.id, genre_id_val)
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
        
        -- Optionally drop the old genres column (uncomment after verifying migration)
        -- ALTER TABLE book DROP COLUMN IF EXISTS genres;
        
    END IF;
END $$;

-- Step 6: Add data integrity constraints
ALTER TABLE book ADD CONSTRAINT check_book_id_positive CHECK (id > 0);
ALTER TABLE genre ADD CONSTRAINT check_genre_value_not_empty CHECK (char_length(value) > 0);
