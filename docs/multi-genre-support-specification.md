# Multi-Genre Support Implementation Specification

## Overview

This document outlines the database schema changes and implementation details for adding multi-genre support to the book application using Drizzle ORM with PostgreSQL.

## Current State

- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM v0.45.1
- **Driver**: Neon HTTP
- **Existing table**: `book` with genres stored as comma-separated text

## 1. Schema Changes

### File: `db/schema.ts`

#### New Table: `genre`

Stores the list of available genres.

```typescript
import { pgTable, serial, text, integer, bigint, primaryKey } from 'drizzle-orm/pg-core'

// Genre table
export const genre = pgTable('genre', {
  id: serial('id').primaryKey(),
  value: text('value').notNull().unique(), // e.g., "Fiction", "Mystery"
})
```

#### New Table: `book_genre` (Join Table)

Many-to-many relationship between books and genres.

```typescript
export const bookGenre = pgTable(
  'book_genre',
  {
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    genreId: integer('genre_id')
      .notNull()
      .references(() => genre.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    // Composite primary key prevents duplicate relationships
    pk: primaryKey({ columns: [table.bookId, table.genreId] }),
    // Index for efficient lookups by book
    bookIdIdx: index('book_genre_book_id_idx').on(table.bookId),
    // Index for efficient lookups by genre
    genreIdIdx: index('book_genre_genre_id_idx').on(table.genreId),
  }),
)
```

### Relation Definitions

```typescript
import { relations } from 'drizzle-orm'

// Genre relations
export const genreRelations = relations(genre, ({ many }) => ({
  books: many(bookGenre),
}))

// Book Genre relations
export const bookGenreRelations = relations(bookGenre, ({ one }) => ({
  book: one(books, {
    fields: [bookGenre.bookId],
    references: [books.id],
  }),
  genre: one(genre, {
    fields: [bookGenre.genreId],
    references: [genre.id],
  }),
}))

// Update existing books relations to include genres
export const booksRelations = relations(books, ({ many }) => ({
  genres: many(bookGenre),
}))
```

## 2. Updated Schema File

### File: `db/schema.ts` (Complete)

```typescript
import { pgTable, serial, text, integer, bigint, primaryKey, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Books table - remove old genres field
export const books = pgTable('book', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  pages: integer('pages').notNull(),
  isbn13: bigint('isbn13', { mode: 'number' }).notNull(),
  // Note: genres field removed - now handled via book_genre join table
})

// Genre table - stores all available genres
export const genre = pgTable('genre', {
  id: serial('id').primaryKey(),
  value: text('value').notNull().unique(),
})

// Book-Genre join table - many-to-many relationship
export const bookGenre = pgTable(
  'book_genre',
  {
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    genreId: integer('genre_id')
      .notNull()
      .references(() => genre.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bookId, table.genreId] }),
    bookIdIdx: index('book_genre_book_id_idx').on(table.bookId),
    genreIdIdx: index('book_genre_genre_id_idx').on(table.genreId),
  }),
)

// Relation: Book has many book-genre associations
export const booksRelations = relations(books, ({ many }) => ({
  genres: many(bookGenre),
}))

// Relation: Genre has many book-genre associations
export const genreRelations = relations(genre, ({ many }) => ({
  books: many(bookGenre),
}))

// Relation: Book-genre belongs to both book and genre
export const bookGenreRelations = relations(bookGenre, ({ one }) => ({
  book: one(books, {
    fields: [bookGenre.bookId],
    references: [books.id],
  }),
  genre: one(genre, {
    fields: [bookGenre.genreId],
    references: [genre.id],
  }),
}))
```

## 3. Migration Script

### File: `drizzle/0003_add_genre_tables.sql`

```sql
-- Migration: Add genre and book_genre tables for multi-genre support
-- Date: 2026-03-21

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

-- Step 5: Migrate existing book genres (if any books exist with genres)
-- This handles comma-separated or JSON string genres from the old format
DO $$
DECLARE
    book_record RECORD;
    genre_name text;
    genre_id_val integer;
BEGIN
    -- Only migrate if old genres field has data
    FOR book_record IN
        SELECT id, genres FROM book WHERE genres IS NOT NULL AND genres != ''
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

            -- Get or create genre
            SELECT id INTO genre_id_val FROM genre WHERE value = genre_name;

            IF genre_id_val IS NULL THEN
                -- Create new genre if it doesn't exist
                INSERT INTO genre (value) VALUES (genre_name) RETURNING id INTO genre_id_val;
            END IF;

            -- Create book-genre relationship
            INSERT INTO book_genre (book_id, genre_id)
            VALUES (book_record.id, genre_id_val)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Step 6: Add check constraint for data integrity (optional but recommended)
ALTER TABLE book ADD CONSTRAINT check_book_id_positive CHECK (id > 0);
ALTER TABLE genre ADD CONSTRAINT check_genre_value_not_empty CHECK (char_length(value) > 0);
```

## 4. Drizzle Kit Migration Generation

After updating the schema file, generate migration with:

```bash
npx drizzle-kit generate:pg
```

This will create a new migration file in the `drizzle/` folder based on schema changes.

## 5. CRUD Operation Examples

### File: `db/queries.ts` (New file)

```typescript
import { db } from './index'
import { books, genre, bookGenre } from './schema'
import { eq, and } from 'drizzle-orm'

// ============================================================================
// GENRE OPERATIONS
// ============================================================================

/**
 * Get all available genres
 */
export async function getAllGenres() {
  return db.select().from(genre).orderBy(genre.value)
}

/**
 * Get genre by ID
 */
export async function getGenreById(id: number) {
  const result = await db.select().from(genre).where(eq(genre.id, id))
  return result[0] || null
}

/**
 * Create a new genre
 */
export async function createGenre(value: string) {
  const result = await db.insert(genre).values({ value }).returning()
  return result[0]
}

/**
 * Get or create genre (useful for user-created genres)
 */
export async function getOrCreateGenre(value: string) {
  // Try to find existing genre
  const existing = await db.select().from(genre).where(eq(genre.value, value))

  if (existing.length > 0) {
    return existing[0]
  }

  // Create new genre
  return createGenre(value)
}

/**
 * Delete genre by ID
 */
export async function deleteGenre(id: number) {
  // Will cascade delete related book_genre entries due to FK constraint
  await db.delete(genre).where(eq(genre.id, id))
}

// ============================================================================
// BOOK-GENRE RELATIONSHIP OPERATIONS
// ============================================================================

/**
 * Get all genres for a specific book
 */
export async function getBookGenres(bookId: number) {
  return db
    .select({
      genreId: genre.id,
      genreValue: genre.value,
    })
    .from(bookGenre)
    .innerJoin(genre, eq(bookGenre.genreId, genre.id))
    .where(eq(bookGenre.bookId, bookId))
}

/**
 * Get all genre IDs for a specific book (for form selects)
 */
export async function getBookGenreIds(bookId: number) {
  const results = await db
    .select({ genreId: bookGenre.genreId })
    .from(bookGenre)
    .where(eq(bookGenre.bookId, bookId))

  return results.map((r) => r.genreId)
}

/**
 * Set genres for a book (replaces all existing relationships)
 */
export async function setBookGenres(bookId: number, genreIds: number[]) {
  // Delete all existing relationships
  await db.delete(bookGenre).where(eq(bookGenre.bookId, bookId))

  // Insert new relationships
  if (genreIds.length > 0) {
    const insertValues = genreIds.map((genreId) => ({
      bookId,
      genreId,
    }))

    await db.insert(bookGenre).values(insertValues)
  }
}

/**
 * Add a single genre to a book
 */
export async function addGenreToBook(bookId: number, genreId: number) {
  await db.insert(bookGenre).values({ bookId, genreId }).onConflictDoNothing()
}

/**
 * Remove a single genre from a book
 */
export async function removeGenreFromBook(bookId: number, genreId: number) {
  await db
    .delete(bookGenre)
    .where(and(eq(bookGenre.bookId, bookId), eq(bookGenre.genreId, genreId)))
}

// ============================================================================
// COMPLETE BOOK OPERATIONS (with genres)
// ============================================================================

/**
 * Get all books with their genres
 */
export async function getAllBooksWithGenres() {
  const booksWithGenres = await db.query.books.findMany({
    with: {
      genres: {
        with: {
          genre: true,
        },
      },
    },
  })

  // Transform to flatten genre data
  return booksWithGenres.map((book) => ({
    ...book,
    genres: book.genres.map((bg) => bg.genre),
  }))
}

/**
 * Get a single book with genres
 */
export async function getBookWithGenres(bookId: number) {
  const result = await db.query.books.findFirst({
    where: eq(books.id, bookId),
    with: {
      genres: {
        with: {
          genre: true,
        },
      },
    },
  })

  if (!result) return null

  return {
    ...result,
    genres: result.genres.map((bg) => bg.genre),
  }
}

/**
 * Create a new book with genres
 */
export async function createBookWithGenres(
  bookData: {
    title: string
    author: string
    pages: number
    isbn13: number
  },
  genreIds: number[],
) {
  // Insert book
  const [newBook] = await db.insert(books).values(bookData).returning()

  // Insert book-genre relationships
  if (genreIds.length > 0) {
    const genreRelations = genreIds.map((genreId) => ({
      bookId: newBook.id,
      genreId,
    }))
    await db.insert(bookGenre).values(genreRelations)
  }

  // Return book with genres
  return getBookWithGenres(newBook.id)
}

/**
 * Update a book and its genres
 */
export async function updateBookWithGenres(
  bookId: number,
  bookData: {
    title?: string
    author?: string
    pages?: number
    isbn13?: number
  },
  genreIds: number[],
) {
  // Update book data
  if (Object.keys(bookData).length > 0) {
    await db.update(books).set(bookData).where(eq(books.id, bookId))
  }

  // Replace genres
  await setBookGenres(bookId, genreIds)

  // Return updated book with genres
  return getBookWithGenres(bookId)
}

/**
 * Delete a book (genres will cascade delete via FK)
 */
export async function deleteBook(bookId: number) {
  await db.delete(books).where(eq(books.id, bookId))
  // book_genre entries are automatically deleted by CASCADE
}

// ============================================================================
// BROWSE/SEARCH OPERATIONS
// ============================================================================

/**
 * Get books by genre ID
 */
export async function getBooksByGenre(genreId: number) {
  const results = await db
    .select({
      book: books,
    })
    .from(bookGenre)
    .innerJoin(books, eq(bookGenre.bookId, books.id))
    .where(eq(bookGenre.genreId, genreId))

  return results.map((r) => r.book)
}

/**
 * Get books by multiple genre IDs (OR logic)
 */
export async function getBooksByAnyGenre(genreIds: number[]) {
  const results = await db
    .select({
      book: books,
    })
    .from(bookGenre)
    .innerJoin(books, eq(bookGenre.bookId, books.id))
    .where
    // Using `inArray` from drizzle-orm
    // eq(bookGenre.genreId, genreIds[0]) // Simplified for example
    ()

  return results.map((r) => r.book)
}

/**
 * Get genre statistics (count of books per genre)
 */
export async function getGenreStats() {
  return db
    .select({
      genreId: genre.id,
      genreValue: genre.value,
      bookCount: db.count(bookGenre.genreId),
    })
    .from(genre)
    .leftJoin(bookGenre, eq(genre.id, bookGenre.genreId))
    .groupBy(genre.id)
}
```

## 6. Type Definitions

### File: `db/types.ts` (New file)

```typescript
import { books, genre, bookGenre } from './schema'

// Type for a single genre
export type Genre = typeof genre.$inferSelect

// Type for creating a genre
export type NewGenre = typeof genre.$inferInsert

// Type for book-genre relationship
export type BookGenre = typeof bookGenre.$inferSelect

// Book with genres (for API responses)
export interface BookWithGenres {
  id: number
  title: string
  author: string
  pages: number
  isbn13: number
  genres: Genre[]
}

// Input for creating/updating book with genres
export interface BookInput {
  title: string
  author: string
  pages: number
  isbn13: number
  genreIds: number[]
}
```

## 7. API Route Examples

### File: `app/api/genres/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getAllGenres, createGenre } from '@/db/queries'

export async function GET() {
  try {
    const genres = await getAllGenres()
    return NextResponse.json(genres)
  } catch (error) {
    console.error('Error fetching genres:', error)
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { value } = await request.json()

    if (!value || typeof value !== 'string') {
      return NextResponse.json({ error: 'Genre value is required' }, { status: 400 })
    }

    const genre = await createGenre(value.trim())
    return NextResponse.json(genre, { status: 201 })
  } catch (error) {
    console.error('Error creating genre:', error)
    return NextResponse.json({ error: 'Failed to create genre' }, { status: 500 })
  }
}
```

### File: `app/api/books/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getBookWithGenres, updateBookWithGenres, deleteBook } from '@/db/queries'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const book = await getBookWithGenres(id)

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const { title, author, pages, isbn13, genreIds } = await request.json()

    const book = await updateBookWithGenres(
      id,
      {
        title,
        author,
        pages,
        isbn13,
      },
      genreIds || [],
    )

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    await deleteBook(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
  }
}
```

## 8. Implementation Checklist

### Phase 1: Database Schema

- [ ] Update `db/schema.ts` with new tables and relations
- [ ] Update `db/index.ts` to export new schema items
- [ ] Generate migration with `npx drizzle-kit generate:pg`
- [ ] Review generated migration file
- [ ] Run migration with `npx drizzle-kit push:pg`

### Phase 2: Backend Operations

- [ ] Create `db/queries.ts` with CRUD operations
- [ ] Create `db/types.ts` with TypeScript types
- [ ] Test all query functions

### Phase 3: API Routes

- [ ] Create/update genre API routes
- [ ] Update book API routes to handle genres
- [ ] Add validation and error handling

### Phase 4: Frontend Integration

- [ ] Update book form to handle multiple genre selection
- [ ] Update book display to show genres
- [ ] Add genre management UI

### Phase 5: Data Migration

- [ ] Backup existing data
- [ ] Run migration script
- [ ] Verify data integrity
- [ ] Update frontend to use new genre format

## 9. Performance Considerations

### Indexes

- `book_genre_book_id_idx`: Fast lookup of all genres for a book
- `book_genre_genre_id_idx`: Fast lookup of all books for a genre
- Composite primary key on (book_id, genre_id): Prevents duplicates

### Query Optimization

- Use `with` relations in Drizzle to fetch related data efficiently
- Consider pagination for listing books
- Use `db.count()` for statistics instead of fetching all records

### Caching Recommendations

- Cache frequently accessed genre lists (Redis, in-memory)
- Consider caching book-genre relationships
- Implement cache invalidation on genre/book updates

## 10. Data Integrity

### Foreign Keys

- `book_genre.book_id` → `book.id` with ON DELETE CASCADE
- `book_genre.genre_id` → `genre.id` with ON DELETE CASCADE

### Constraints

- Unique constraint on `genre.value` prevents duplicate genres
- Composite primary key prevents duplicate book-genre relationships
- Check constraints for positive IDs and non-empty values

### Transaction Handling

All operations that modify multiple tables should use transactions:

```typescript
import { db } from './index'
import { books, bookGenre } from './schema'
import { transaction } from 'drizzle-orm'

async function createBookWithGenresTransactional(bookData, genreIds) {
  return await transaction(async (tx) => {
    const [newBook] = await tx.insert(books).values(bookData).returning()

    if (genreIds.length > 0) {
      const genreRelations = genreIds.map((genreId) => ({
        bookId: newBook.id,
        genreId,
      }))
      await tx.insert(bookGenre).values(genreRelations)
    }

    return newBook
  })
}
```

## 11. Error Handling

### Common Errors to Handle

1. **Duplicate genre**: Genre already exists (unique constraint)
2. **Orphan book_genre**: Book or genre deleted (handled by CASCADE)
3. **Invalid genre ID**: Genre doesn't exist (validation required)
4. **Transaction failure**: Rollback and retry logic

### Logging

- Log all database errors with context
- Monitor migration failures
- Track query performance issues

## 12. Testing Strategy

### Unit Tests

- Test all query functions
- Test edge cases (empty genres, max genres per book)

### Integration Tests

- Test API endpoints
- Test data integrity after migrations
- Test concurrent operations

### Manual Testing

- Verify genre CRUD in UI
- Test book creation with multiple genres
- Test book editing (add/remove genres)
- Test deletion cascade behavior

## 13. Rollback Plan

If issues arise, rollback procedure:

1. **Database**: Restore from pre-migration backup
2. **Code**: Revert schema changes in schema.ts
3. **Migrations**: Delete migration file
4. **Frontend**: Keep backwards compatible if possible

## 14. File Locations Summary

```
nextjs-typescript-starter/
├── db/
│   ├── schema.ts          # Update: Add genre, bookGenre tables and relations
│   ├── index.ts           # Update: Export new schema items
│   ├── queries.ts         # New: CRUD operations
│   └── types.ts           # New: TypeScript types
├── drizzle/
│   ├── 0003_add_genre_tables.sql  # New: Migration script
│   └── meta/
│       └── _journal.json          # Update: Add migration entry
├── app/api/
│   ├── genres/
│   │   └── route.ts               # New: Genre CRUD API
│   └── books/
│       └── [id]/
│           └── route.ts           # Update: Add genre handling
└── components/
    └── BookForm.tsx               # Update: Multi-select genre input
```

## 15. Next Steps

1. **Review and approve** this specification
2. **Create backup** of existing database
3. **Implement Phase 1** (Database Schema)
4. **Test thoroughly** before proceeding
5. **Iterate** based on testing results

---

**Document Version**: 1.0  
**Date**: 2026-03-21  
**Author**: Backend Specification
