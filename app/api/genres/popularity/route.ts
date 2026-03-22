import { NextResponse } from 'next/server'
import { db } from '@/db'
import { genre, bookGenre } from '@/db/schema'
import { sql, eq } from 'drizzle-orm'

export async function GET() {
  try {
    const result = await db
      .select({
        id: genre.id,
        value: genre.value,
        count: sql<number>`count(${bookGenre.bookId})`,
      })
      .from(genre)
      .leftJoin(bookGenre, eq(genre.id, bookGenre.genreId))
      .groupBy(genre.id, genre.value)
      .orderBy(sql`count(${bookGenre.bookId}) desc`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch genre popularity:', error)
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 })
  }
}
