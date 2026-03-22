import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { books, genre, bookGenre } from '@/db/schema'
import { eq } from 'drizzle-orm'

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`)
const db = drizzle(client)

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
      return NextResponse.json({ book: null, genres: [] })
    }

    const genres = await db
      .select({ id: genre.id, value: genre.value })
      .from(bookGenre)
      .innerJoin(genre, eq(bookGenre.genreId, genre.id))
      .where(eq(bookGenre.bookId, bookId))

    return NextResponse.json({ book: result[0], genres })
  } catch (error) {
    console.error('Failed to fetch book:', error)
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 })
  }
}
