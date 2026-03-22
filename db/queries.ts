/**
 * Example queries for multi-genre book operations
 * This file demonstrates common patterns for working with books and genres
 */

import { db } from './index'
import { books, genre, bookGenre, borrows } from './schema'
import { eq, and, inArray, isNull, isNotNull } from 'drizzle-orm'

// ============================================================================
// BASIC GENRE OPERATIONS
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
  const results = await db.select().from(genre).where(eq(genre.id, id))
  return results[0] || null
}

/**
 * Create a new genre
 */
export async function createGenre(value: string) {
  const results = await db.insert(genre).values({ value }).returning()
  return results[0]
}

/**
 * Delete a genre
 */
export async function deleteGenre(id: number) {
  await db.delete(genre).where(eq(genre.id, id))
}

// ============================================================================
// BOOK-GENRE RELATIONSHIP OPERATIONS
// ============================================================================

/**
 * Get all genres for a specific book
 */
export async function getBookGenres(bookId: number) {
  const results = await db
    .select({
      id: genre.id,
      value: genre.value,
    })
    .from(bookGenre)
    .innerJoin(genre, eq(bookGenre.genreId, genre.id))
    .where(eq(bookGenre.bookId, bookId))

  return results
}

/**
 * Get all genre IDs for a book (useful for form selection)
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
 * Delete a book (genres are cascade deleted)
 */
export async function deleteBook(bookId: number) {
  await db.delete(books).where(eq(books.id, bookId))
}

// ============================================================================
// SEARCH AND FILTERING
// ============================================================================

/**
 * Get all books in a specific genre
 */
export async function getBooksByGenre(genreId: number) {
  const results = await db
    .select({ book: books })
    .from(bookGenre)
    .innerJoin(books, eq(bookGenre.bookId, books.id))
    .where(eq(bookGenre.genreId, genreId))

  return results.map((r) => r.book)
}

/**
 * Get books by multiple genres (any match)
 */
export async function getBooksByAnyGenre(genreIds: number[]) {
  const results = await db
    .select({ book: books })
    .from(bookGenre)
    .innerJoin(books, eq(bookGenre.bookId, books.id))
    .where(inArray(bookGenre.genreId, genreIds))

  return results.map((r) => r.book)
}

/**
 * Get genre statistics
 */
export async function getGenreStats() {
  return db
    .select({
      genreId: genre.id,
      genreValue: genre.value,
      bookCount: db.$count(bookGenre, eq(bookGenre.genreId, genre.id)),
    })
    .from(genre)
}

/**
 * Search books by title (with genres)
 */
export async function searchBooks(query: string) {
  const results = await db.query.books.findMany({
    where: eq(books.title, query), // Replace with ILIKE for case-insensitive
    with: {
      genres: {
        with: {
          genre: true,
        },
      },
    },
  })

  return results.map((book) => ({
    ...book,
    genres: book.genres.map((bg) => bg.genre),
  }))
}

// ============================================================================
// BORROW OPERATIONS
// ============================================================================

export type BorrowStatus = 'available' | 'borrowed' | 'pending' | 'returned'

export async function createBorrowRequest(bookId: number, ownerId: string, borrowerId: string) {
  const results = await db
    .insert(borrows)
    .values({
      bookId,
      ownerId,
      borrowerId,
    })
    .returning()
  return results[0]
}

export async function getBorrowsByBook(bookId: number) {
  return db.select().from(borrows).where(eq(borrows.bookId, bookId))
}

export async function getActiveBorrowForBook(bookId: number) {
  const results = await db
    .select()
    .from(borrows)
    .where(
      and(eq(borrows.bookId, bookId), isNotNull(borrows.approvedAt), isNull(borrows.returnedAt)),
    )
  return results[0] || null
}

export async function getPendingRequestForBook(bookId: number) {
  const results = await db
    .select()
    .from(borrows)
    .where(and(eq(borrows.bookId, bookId), isNull(borrows.approvedAt), isNull(borrows.rejectedAt)))
  return results[0] || null
}

export async function getBorrowsByBorrower(borrowerId: string) {
  return db.select().from(borrows).where(eq(borrows.borrowerId, borrowerId))
}

export async function getBorrowsByOwner(ownerId: string) {
  return db.select().from(borrows).where(eq(borrows.ownerId, ownerId))
}

export async function getBorrowById(borrowId: string) {
  const results = await db.select().from(borrows).where(eq(borrows.id, borrowId))
  return results[0] || null
}

export async function approveBorrow(borrowId: string, ownerId: string) {
  const results = await db
    .update(borrows)
    .set({ approvedAt: new Date() })
    .where(and(eq(borrows.id, borrowId), eq(borrows.ownerId, ownerId)))
    .returning()
  return results[0] || null
}

export async function rejectBorrow(borrowId: string, ownerId: string) {
  const results = await db
    .update(borrows)
    .set({ rejectedAt: new Date() })
    .where(and(eq(borrows.id, borrowId), eq(borrows.ownerId, ownerId)))
    .returning()
  return results[0] || null
}

export async function markReturned(borrowId: string, borrowerId: string) {
  const results = await db
    .update(borrows)
    .set({ returnedAt: new Date() })
    .where(and(eq(borrows.id, borrowId), eq(borrows.borrowerId, borrowerId)))
    .returning()
  return results[0] || null
}

export async function confirmReturn(borrowId: string, ownerId: string) {
  const results = await db
    .update(borrows)
    .set({ ownerConfirmedReturnAt: new Date() })
    .where(and(eq(borrows.id, borrowId), eq(borrows.ownerId, ownerId)))
    .returning()
  return results[0] || null
}

export async function getPendingReturns(ownerId: string) {
  return db
    .select()
    .from(borrows)
    .where(
      and(
        eq(borrows.ownerId, ownerId),
        isNotNull(borrows.returnedAt),
        isNull(borrows.ownerConfirmedReturnAt),
      ),
    )
}

export async function getBookBorrowStatus(bookId: number): Promise<BorrowStatus> {
  const activeBorrow = await getActiveBorrowForBook(bookId)
  if (activeBorrow) return 'borrowed'

  const pendingRequest = await getPendingRequestForBook(bookId)
  if (pendingRequest) return 'pending'

  return 'available'
}
