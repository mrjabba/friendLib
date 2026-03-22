import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { books, genre, bookGenre, borrows } from '@/db/schema'
import { eq, and, isNull, isNotNull } from 'drizzle-orm'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const bookId = parseInt(id, 10)

    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 })
    }

    const result = await db
      .select({
        id: books.id,
        title: books.title,
        author: books.author,
        pages: books.pages,
        isbn13: books.isbn13,
        userId: books.userId,
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ book: null, genres: [], borrowStatus: null })
    }

    const genres = await db
      .select({ id: genre.id, value: genre.value })
      .from(bookGenre)
      .innerJoin(genre, eq(bookGenre.genreId, genre.id))
      .where(eq(bookGenre.bookId, bookId))

    const activeBorrow = await db
      .select()
      .from(borrows)
      .where(
        and(eq(borrows.bookId, bookId), isNotNull(borrows.approvedAt), isNull(borrows.returnedAt)),
      )
      .limit(1)

    const pendingRequest = await db
      .select()
      .from(borrows)
      .where(
        and(eq(borrows.bookId, bookId), isNull(borrows.approvedAt), isNull(borrows.rejectedAt)),
      )
      .limit(1)

    let borrowStatus: 'available' | 'borrowed' | 'pending' = 'available'
    let activeBorrowData = null

    if (activeBorrow.length > 0) {
      borrowStatus = 'borrowed'
      activeBorrowData = activeBorrow[0]
    } else if (pendingRequest.length > 0) {
      borrowStatus = 'pending'
    }

    return NextResponse.json({
      book: result[0],
      genres,
      borrowStatus,
      activeBorrow: activeBorrowData,
    })
  } catch (error) {
    console.error('Failed to fetch book:', error)
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 })
  }
}
