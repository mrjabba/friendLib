# Multi-Genre Support Implementation Guide

## Overview

This guide walks you through implementing multi-genre support for your book application step by step.

## Prerequisites

- Backup your database before proceeding
- Ensure you have access to your PostgreSQL database (Neon)
- Node.js and npm/pnpm installed

## Step-by-Step Implementation

### Phase 1: Update Schema

**File**: `db/schema.ts`

1. Open `db/schema.ts`
2. Replace the entire content with the new schema that includes:
   - Updated `books` table (remove `genres` field)
   - New `genre` table
   - New `bookGenre` join table
   - All relation definitions

### Phase 2: Create Queries Module

**File**: `db/queries.ts`

1. Copy the provided `queries.ts` content to `db/queries.ts`
2. This file contains all CRUD operations for books and genres

### Phase 3: Generate and Run Migration

```bash
# 1. Generate migration based on new schema
npx drizzle-kit generate:pg

# 2. Review the generated migration in drizzle/ folder
# It should create the genre and book_genre tables

# 3. Push schema to database
npx drizzle-kit push:pg

# 4. Run the manual migration script (optional but recommended)
# This adds initial genres and migrates existing data
psql $DATABASE_URL < drizzle/0003_add_genre_tables.sql

# 5. Open Drizzle Studio to verify
npx drizzle-kit studio
```

### Phase 4: Update API Routes

Create/update API routes for genre management:

**File**: `app/api/genres/route.ts`

- GET: List all genres
- POST: Create new genre

**File**: `app/api/books/[id]/route.ts`

- Update to handle genreIds array in request body

### Phase 5: Frontend Integration

Update your UI components:

1. **BookForm**: Add multi-select for genres
2. **BookCard**: Display genre tags
3. **BookList**: Show genre filters

## Testing Checklist

### Backend Testing

- [ ] Can create a new genre
- [ ] Can list all genres
- [ ] Can delete a genre
- [ ] Can create a book with multiple genres
- [ ] Can update book genres
- [ ] Can delete a book (verify cascade delete)
- [ ] Can query books by genre

### Frontend Testing

- [ ] Genre selection in book form works
- [ ] Book displays show genres correctly
- [ ] Can edit book genres
- [ ] Genre filter works (if implemented)

## Common Issues & Solutions

### Issue: Migration Fails

**Solution**:

- Check database connection in `.env`
- Ensure Neon database is active
- Verify DATABASE_URL is correct

### Issue: Circular Dependencies

**Solution**:

- Drizzle relations can create circular imports
- Use forward references if needed: `import type { books } from "./schema"`

### Issue: Type Errors

**Solution**:

- Run `npx tsc --noEmit` to check types
- Update TypeScript types if schema changes
- Restart Next.js dev server after schema changes

### Issue: Existing Data Not Migrated

**Solution**:

- Run the migration script manually
- Check the `genres` field format (comma-separated, JSON, etc.)
- Adjust the migration script if needed

## Performance Tips

1. **Indexes**: Already created in migration
   - `book_genre_book_id_idx`: For fetching genres of a book
   - `book_genre_genre_id_idx`: For fetching books of a genre

2. **Query Optimization**:
   - Use `with` relations to fetch related data in single query
   - Avoid N+1 queries by using joins

3. **Caching**:
   - Consider caching genre list (doesn't change often)
   - Use Redis or Next.js caching for book-genre lookups

## Example API Usage

### Create Book with Genres

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Book",
    "author": "John Doe",
    "pages": 300,
    "isbn13": 1234567890123,
    "genreIds": [1, 3, 5]
  }'
```

### Get Book with Genres

```bash
curl http://localhost:3000/api/books/1
```

### Update Book Genres

```bash
curl -X PUT http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{
    "genreIds": [2, 4]
  }'
```

### Get All Genres

```bash
curl http://localhost:3000/api/genres
```

### Create New Genre

```bash
curl -X POST http://localhost:3000/api/genres \
  -H "Content-Type: application/json" \
  -d '{"value": "Science Fantasy"}'
```

## Data Format Examples

### Book with Genres (API Response)

```json
{
  "id": 1,
  "title": "The Great Book",
  "author": "John Doe",
  "pages": 300,
  "isbn13": 1234567890123,
  "genres": [
    { "id": 1, "value": "Fiction" },
    { "id": 3, "value": "Science Fiction" }
  ]
}
```

### Genre List (API Response)

```json
[
  { "id": 1, "value": "Fiction" },
  { "id": 2, "value": "Non-Fiction" },
  { "id": 3, "value": "Science Fiction" }
]
```

## Rollback Instructions

If you need to rollback:

1. **Database**:

   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup_pre_migration.sql
   ```

2. **Code**:

   ```bash
   # Revert schema changes
   git checkout HEAD -- db/schema.ts
   ```

3. **Migrations**:
   ```bash
   # Remove migration file
   rm drizzle/0003_add_genre_tables.sql
   ```

## Next Features to Consider

1. **Genre Hierarchy**: Parent-child genres (e.g., Fiction → Mystery → Thriller)
2. **Genre Suggestions**: Suggest genres based on book metadata
3. **Genre Popularity**: Track most popular genres
4. **User Preferences**: Save user's favorite genres
5. **Bulk Genre Assignment**: Apply genres to multiple books

## Resources

- Drizzle ORM Docs: https://orm.drizzle.team/docs/overview
- Drizzle Relations: https://orm.drizzle.team/docs/relations
- Neon PostgreSQL: https://neon.tech/docs
- Drizzle Kit: https://orm.drizzle.team/docs/kit-overview

## Support

If you encounter issues:

1. Check the full specification: `docs/multi-genre-support-specification.md`
2. Review quick reference: `docs/multi-genre-quick-reference.md`
3. Check existing migrations in `drizzle/` folder
4. Use `npx drizzle-kit studio` to inspect database state

---

**Version**: 1.0  
**Last Updated**: 2026-03-21  
**Estimated Time**: 2-4 hours
