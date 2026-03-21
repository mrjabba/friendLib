'use server'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { genre, bookGenre } from '@/db/schema'
import { sql, eq } from 'drizzle-orm'

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`)
const db = drizzle(client)

export async function getGenrePopularity() {
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

  return result
}

export async function getGenreById(id: number) {
  const result = await db.select().from(genre).where(eq(genre.id, id)).limit(1)
  return result[0] || null
}
