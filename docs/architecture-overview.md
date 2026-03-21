# Multi-Genre Support - Architecture Overview

## Database Schema Diagram

```
┌─────────────────┐
│     genre       │
├─────────────────┤
│ id (PK)         │
│ value (UNIQUE)  │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐     N:M      ┌─────────────────┐
│   book_genre    │──────────────│      book       │
├─────────────────┤              ├─────────────────┤
│ book_id (FK)    │              │ id (PK)         │
│ genre_id (FK)   │              │ title           │
│ (PK: composite) │              │ author          │
└─────────────────┘              │ pages           │
                                │ isbn13          │
                                └─────────────────┘

Legend:
- PK: Primary Key
- FK: Foreign Key
- UNIQUE: Unique Constraint
- 1:N: One-to-Many
- N:M: Many-to-Many (via join table)
```

## Relationships

### 1. Book → BookGenre (One-to-Many)

- One book can have multiple book_genre records
- Each record links the book to one genre

### 2. Genre → BookGenre (One-to-Many)

- One genre can be associated with multiple books
- Each record links the genre to one book

### 3. Book ←→ Genre (Many-to-Many)

- Achieved through the book_genre join table
- A book can have zero or more genres
- A genre can be associated with zero or more books

## Data Flow

### Creating a Book with Genres

```
Frontend Request
     │
     ▼
API Route (/api/books)
     │
     ├─► Insert book record
     │
     ├─► Insert book_genre records (for each genre)
     │
     ▼
Return book with genres
```

### Fetching Book with Genres

```
Query: getBookWithGenres(bookId)
     │
     ▼
┌─────────────────────────────┐
│ SELECT * FROM book          │
│ WHERE id = bookId           │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ SELECT genre.* FROM genre    │
│ INNER JOIN book_genre ON ... │
│ WHERE book_genre.book_id     │
└─────────────┬───────────────┘
              │
              ▼
Return: Book with genres array
```

### Deleting a Genre

```
Delete genre (id = 1)
     │
     ▼
┌─────────────────────────────┐
│ DELETE FROM book_genre      │
│ WHERE genre_id = 1          │
│ (CASCADE due to FK)         │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ DELETE FROM genre           │
│ WHERE id = 1                │
└─────────────────────────────┘

All book_genre associations are automatically removed
```

## Index Strategy

### book_genre Table Indexes

1. **Primary Key** (book_id, genre_id)
   - Ensures unique relationships
   - Fast lookup for specific book-genre pair

2. **Index on book_id**
   - `book_genre_book_id_idx`
   - Fast: "Get all genres for this book"
   - Used in: getBookGenres(), getBookWithGenres()

3. **Index on genre_id**
   - `book_genre_genre_id_idx`
   - Fast: "Get all books with this genre"
   - Used in: getBooksByGenre(), getGenreStats()

### Performance Comparison

| Operation              | Without Index   | With Index          |
| ---------------------- | --------------- | ------------------- |
| Get genres for book    | Full table scan | Index seek          |
| Get books for genre    | Full table scan | Index seek          |
| Add genre to book      | Table scan      | Index seek + insert |
| Remove genre from book | Table scan      | Index seek + delete |

## Cascade Delete Rules

### ON DELETE CASCADE

Applied to both foreign keys in book_genre:

1. **book_id FK**: If book is deleted → delete related book_genre records
2. **genre_id FK**: If genre is deleted → delete related book_genre records

### Examples

**Delete Book #1:**

```
DELETE FROM book WHERE id = 1
  → Automatically removes all book_genre records with book_id = 1
```

**Delete Genre "Fiction" (#1):**

```
DELETE FROM genre WHERE id = 1
  → Automatically removes all book_genre records with genre_id = 1
```

## Query Patterns

### Pattern 1: Fetch Book with All Genres

```typescript
// Single query using Drizzle relations
const book = await db.query.books.findFirst({
  where: eq(books.id, 1),
  with: {
    genres: {
      with: {
        genre: true,
      },
    },
  },
})

// Transform to flatten
const result = {
  ...book,
  genres: book.genres.map((bg) => bg.genre),
}
```

### Pattern 2: Fetch All Books in Genre

```typescript
// Two-table join
const books = await db
  .select({ book: books })
  .from(bookGenre)
  .innerJoin(books, eq(bookGenre.bookId, books.id))
  .where(eq(bookGenre.genreId, 1))
```

### Pattern 3: Count Books per Genre

```typescript
// Aggregation query
const stats = await db
  .select({
    genreId: genre.id,
    genreValue: genre.value,
    count: db.count(bookGenre.genreId),
  })
  .from(genre)
  .leftJoin(bookGenre, eq(genre.id, bookGenre.genreId))
  .groupBy(genre.id)
```

## Data Integrity

### Constraints Applied

1. **Unique on genre.value**
   - Prevents duplicate genre names
   - Example: Can't have two "Fiction" genres

2. **Composite Primary Key on (book_id, genre_id)**
   - Prevents duplicate book-genre relationships
   - Example: Can't link Book #1 to Genre #1 twice

3. **Foreign Keys with CASCADE**
   - Ensures referential integrity
   - Automatic cleanup of orphaned records

4. **Check Constraints**
   - `book.id > 0`: Positive book IDs
   - `char_length(genre.value) > 0`: Non-empty genre names

## Scalability Considerations

### Current Design

- **Genre Table**: O(n) where n = number of genres
  - Expected: < 100 genres
  - No performance concerns

- **BookGenre Table**: O(n × m) where n = books, m = avg genres per book
  - Expected: ~10 genres per book
  - 10K books = 100K relationships
  - Fully indexed, acceptable performance

### Potential Bottlenecks

1. **Large Number of Genres per Book**
   - Solution: Limit to reasonable number (e.g., 5-10)
   - UI: Multi-select with max selection

2. **Mass Genre Updates**
   - Problem: Updating all books in a genre
   - Solution: Batch updates with transactions

3. **Genre List Query Frequency**
   - Solution: Cache genre list
   - TTL: 1 hour or on modification

### Future Optimizations

1. **Partitioning**: If book_genre exceeds 1M rows
2. **Read Replicas**: For heavy read loads
3. **Caching Layer**: Redis for frequently accessed data
4. **Denormalization**: Store genre names on book_genre if needed

## Transaction Examples

### Atomic Book Creation

```typescript
async function createBookAtomic(bookData, genreIds) {
  return await db.transaction(async (tx) => {
    // Step 1: Create book
    const [book] = await tx.insert(books).values(bookData).returning()

    // Step 2: Create genre relationships
    if (genreIds.length > 0) {
      const relations = genreIds.map((gid) => ({
        bookId: book.id,
        genreId: gid,
      }))
      await tx.insert(bookGenre).values(relations)
    }

    // Step 3: Return created book
    return book
  })
}
```

### Safe Genre Deletion

```typescript
async function safeDeleteGenre(genreId) {
  return await db.transaction(async (tx) => {
    // Step 1: Check if genre has books
    const bookCount = await tx
      .select({ count: db.count() })
      .from(bookGenre)
      .where(eq(bookGenre.genreId, genreId))

    if (bookCount > 0) {
      throw new Error(`Cannot delete: ${bookCount} books use this genre`)
    }

    // Step 2: Delete genre
    await tx.delete(genre).where(eq(genre.id, genreId))

    return { success: true }
  })
}
```

## Migration Strategy

### Phase 1: Add New Tables

```sql
CREATE TABLE genre (...);
CREATE TABLE book_genre (...);
CREATE INDEXES ...;
```

### Phase 2: Seed Data

```sql
INSERT INTO genre (value) VALUES
  ('Fiction'), ('Non-Fiction'), ...;
```

### Phase 3: Migrate Existing Data

```sql
-- Parse existing comma-separated genres
-- Convert to book_genre relationships
-- Handle special cases (empty, JSON, etc.)
```

### Phase 4: Verify & Monitor

- Check all books have genres
- Verify no data loss
- Monitor query performance

### Phase 5: Cleanup (Optional)

```sql
-- After full verification, remove old field
ALTER TABLE book DROP COLUMN genres;
```

## Monitoring & Observability

### Key Metrics to Track

1. **Query Performance**
   - Average query time for book-genre joins
   - Index hit rate

2. **Data Distribution**
   - Books per genre
   - Genres per book
   - Most popular genres

3. **Write Operations**
   - Genre creation rate
   - Book-genre update frequency

### Log Queries (Development)

```typescript
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Enable query logging
export const db = drizzle(sql, {
  schema,
  logger: true, // Drizzle will log all queries
})
```

## Testing Strategy

### Unit Tests

- Test each query function
- Test edge cases (empty, max values)
- Test constraint violations

### Integration Tests

- Test API endpoints
- Test data flow end-to-end
- Test concurrent operations

### Load Tests

- Simulate many books with genres
- Measure query performance
- Identify bottlenecks

## Security Considerations

### Input Validation

- Validate genre IDs exist before linking
- Sanitize genre names (trim, uppercase, etc.)
- Limit maximum genres per book

### Access Control

- Only admins can create/delete genres
- Users can assign existing genres to books
- Audit log for genre modifications

### SQL Injection Prevention

- Use parameterized queries (Drizzle does this)
- Never concatenate user input into SQL
- Validate data types

## Error Handling

### Common Errors

1. **Duplicate Genre**

   ```typescript
   try {
     await db.insert(genre).values({ value: 'Fiction' })
   } catch (error) {
     if (error.code === '23505') {
       // Unique violation
       return { error: 'Genre already exists' }
     }
   }
   ```

2. **Orphan Prevention**

   ```typescript
   // Before deleting genre, check for dependencies
   const books = await getBooksByGenre(genreId)
   if (books.length > 0) {
     return { error: 'Cannot delete genre in use' }
   }
   ```

3. **Invalid Reference**
   ```typescript
   // Validate genre exists
   const genre = await getGenreById(genreId)
   if (!genre) {
     return { error: 'Invalid genre ID' }
   }
   ```

## Backup & Recovery

### Before Migration

```bash
# Create full database backup
pg_dump $DATABASE_URL > backup_pre_migration.sql
```

### After Migration

```bash
# Verify data integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM book_genre;"

# Check for orphaned records
psql $DATABASE_URL -c "
  SELECT b.id FROM book b
  LEFT JOIN book_genre bg ON b.id = bg.book_id
  WHERE bg.book_id IS NULL;
"
```

### Recovery

```bash
# Restore from backup if needed
psql $DATABASE_URL < backup_pre_migration.sql
```

## Compliance & Best Practices

### Data Privacy

- Genres are generally not PII
- No special compliance needed

### Naming Conventions

- Table names: snake_case (book_genre)
- Column names: snake_case (genre_id)
- Index names: descriptive with idx suffix

### Code Organization

```
db/
├── schema.ts      # Table definitions
├── relations.ts   # Relation definitions (optional separation)
├── queries.ts     # Query functions
├── types.ts       # TypeScript types
└── index.ts       # DB instance
```

## Conclusion

This architecture provides:

- ✅ Clean separation of concerns
- ✅ Efficient many-to-many relationships
- ✅ Automatic data integrity via constraints
- ✅ Optimized query performance with indexes
- ✅ Safe cascade deletes
- ✅ Scalable design for future growth
- ✅ Easy to understand and maintain

All components follow Drizzle ORM best practices and PostgreSQL conventions.
