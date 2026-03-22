'use server'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { books, genre, bookGenre } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`)
const db = drizzle(client)

export async function getBookById(id: number) {
  const result = await db.select().from(books).where(eq(books.id, id)).limit(1)
  return result[0] || null
}

export async function getBookGenres(bookId: number) {
  const result = await db
    .select({ id: genre.id, value: genre.value })
    .from(bookGenre)
    .innerJoin(genre, eq(bookGenre.genreId, genre.id))
    .where(eq(bookGenre.bookId, bookId))
  return result
}

export async function updateBook(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized: You must be logged in to update a book')
  }

  const id = parseInt(formData.get('id') as string, 10)

  const result = await db
    .select({ userId: books.userId })
    .from(books)
    .where(eq(books.id, id))
    .limit(1)

  if (!result[0] || result[0].userId !== userId) {
    throw new Error('Forbidden: You can only edit your own books')
  }

  const title = formData.get('title') as string
  const author = formData.get('author') as string
  const pages = parseInt(formData.get('pages') as string, 10)
  const genreIds = formData
    .getAll('genreIds')
    .map((gid) => parseInt(gid as string, 10))
    .filter((gid) => !isNaN(gid))
  const isbnInput = (formData.get('isbn13') as string).replace(/-/g, '')
  const isbn13 = parseInt(isbnInput, 10)

  await db.update(books).set({ title, author, pages, isbn13 }).where(eq(books.id, id))

  await db.delete(bookGenre).where(eq(bookGenre.bookId, id))

  if (genreIds.length > 0) {
    await db.insert(bookGenre).values(genreIds.map((genreId) => ({ bookId: id, genreId })))
  }

  redirect(`/actions/book-detail?id=${id}`)
}

export async function getMyBooks() {
  const { userId } = await auth()

  if (!userId) {
    return []
  }

  return await db.select().from(books).where(eq(books.userId, userId))
}
