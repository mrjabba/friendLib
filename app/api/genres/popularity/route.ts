import { NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { genre, bookGenre } from '@/db/schema'
import { sql, eq } from 'drizzle-orm'

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`)
const db = drizzle(client)

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
