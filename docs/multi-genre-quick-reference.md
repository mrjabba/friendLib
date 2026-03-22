# Multi-Genre Support - Quick Reference

## Schema Changes Summary

### 1. Update `db/schema.ts`

```typescript
import { pgTable, serial, text, integer, bigint, primaryKey, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Keep existing books table (remove genres field)
export const books = pgTable('book', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  pages: integer('pages').notNull(),
  isbn13: bigint('isbn13', { mode: 'number' }).notNull(),
})

// NEW: Genre table
export const genre = pgTable('genre', {
  id: serial('id').primaryKey(),
  value: text('value').notNull().unique(),
})

// NEW: Book-Genre join table
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

// Relations
export const booksRelations = relations(books, ({ many }) => ({
  genres: many(bookGenre),
}))

export const genreRelations = relations(genre, ({ many }) => ({
  books: many(bookGenre),
}))

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

## Most Common Operations

### Get All Genres

```typescript
const genres = await db.select().from(genre).orderBy(genre.value)
```

### Get Book with Genres

```typescript
const book = await db.query.books.findFirst({
  where: eq(books.id, bookId),
  with: {
    genres: {
      with: {
        genre: true,
      },
    },
  },
})

// Transform to simple format
const formattedBook = {
  ...book,
  genres: book.genres.map((bg) => bg.genre),
}
```

### Create Book with Genres

```typescript
// Insert book
const [newBook] = await db
  .insert(books)
  .values({
    title: 'New Book',
    author: 'Author Name',
    pages: 300,
    isbn13: 1234567890123,
  })
  .returning()

// Insert genre relationships
await db.insert(bookGenre).values([
  { bookId: newBook.id, genreId: 1 },
  { bookId: newBook.id, genreId: 3 },
])
```

### Update Book Genres

```typescript
// Delete old genres
await db.delete(bookGenre).where(eq(bookGenre.bookId, bookId))

// Insert new genres
await db.insert(bookGenre).values([
  { bookId, genreId: 1 },
  { bookId, genreId: 5 },
])
```

### Delete Genre (Cascades to book_genre)

```typescript
await db.delete(genre).where(eq(genre.id, genreId))
```

## Migration Command

```bash
# Generate migration based on schema changes
npx drizzle-kit generate:pg

# Push schema to database (creates/updates tables)
npx drizzle-kit push:pg

# Open Drizzle Studio to view data
npx drizzle-kit studio
```

## Migration Script (`drizzle/0003_add_genre_tables.sql`)

```sql
-- Create genre table
CREATE TABLE IF NOT EXISTS "genre" (
    "id" serial PRIMARY KEY NOT NULL,
    "value" text NOT NULL UNIQUE
);

-- Create join table
CREATE TABLE IF NOT EXISTS "book_genre" (
    "book_id" integer NOT NULL REFERENCES "book"("id") ON DELETE CASCADE,
    "genre_id" integer NOT NULL REFERENCES "genre"("id") ON DELETE CASCADE,
    PRIMARY KEY ("book_id", "genre_id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "book_genre_book_id_idx" ON "book_genre" ("book_id");
CREATE INDEX IF NOT EXISTS "book_genre_genre_id_idx" ON "book_genre" ("genre_id");

-- Insert default genres
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
```

## Quick Tips

1. **Always use relations** with `with` clause for fetching related data
2. **Use transactions** when modifying multiple tables
3. **Cascade delete** is set up - deleting a book or genre auto-removes relationships
4. **Index both foreign keys** for optimal query performance
5. **Unique constraint** on genre.value prevents duplicates

## File Locations

- Schema: `db/schema.ts`
- DB instance: `db/index.ts`
- Migrations: `drizzle/*.sql`
- Queries: Create new `db/queries.ts`
- Types: Create new `db/types.ts`

## See Also

Full specification: `docs/multi-genre-support-specification.md`
