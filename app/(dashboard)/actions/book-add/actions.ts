'use server'

import { db } from '@/db'
import { books, genre, bookGenre } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export async function getBookGenres(bookId: number) {
  const result = await db
    .select({ id: genre.id, value: genre.value })
    .from(bookGenre)
    .innerJoin(genre, eq(bookGenre.genreId, genre.id))
    .where(eq(bookGenre.bookId, bookId))
  return result
}

export async function addBook(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const title = formData.get('title') as string
  const author = formData.get('author') as string
  const pages = parseInt(formData.get('pages') as string, 10)
  const genreIds = formData
    .getAll('genreIds')
    .map((id) => parseInt(id as string, 10))
    .filter((id) => !isNaN(id))
  const isbnInput = (formData.get('isbn13') as string).replace(/-/g, '')
  const isbn13 = parseInt(isbnInput, 10)

  const result = await db
    .insert(books)
    .values({
      title,
      author,
      pages,
      isbn13,
      userId,
    })
    .returning({ id: books.id })

  const bookId = result[0].id

  if (genreIds.length > 0) {
    await db.insert(bookGenre).values(genreIds.map((genreId) => ({ bookId, genreId })))
  }

  redirect(`/actions/book-detail?id=${bookId}`)
}
