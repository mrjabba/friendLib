'use server'

import { db } from '@/db'
import { genre, bookGenre, books } from '@/db/schema'
import { sql, eq } from 'drizzle-orm'

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

export async function getBooksByGenre(genreId: number) {
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
    .innerJoin(bookGenre, eq(books.id, bookGenre.bookId))
    .where(eq(bookGenre.genreId, genreId))

  return result
}

export async function getBooksByGenreForUser(genreId: number, userId: string) {
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
    .innerJoin(bookGenre, eq(books.id, bookGenre.bookId))
    .where(eq(bookGenre.genreId, genreId))
    .limit(50)

  return result
}
