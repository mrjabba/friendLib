'use server'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { books, bookGenre } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`)
const db = drizzle(client)

export async function deleteBook(id: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized: You must be logged in to delete a book')
  }

  const result = await db
    .select({ userId: books.userId })
    .from(books)
    .where(eq(books.id, id))
    .limit(1)

  if (!result[0] || result[0].userId !== userId) {
    throw new Error('Forbidden: You can only delete your own books')
  }

  await db.delete(bookGenre).where(eq(bookGenre.bookId, id))
  await db.delete(books).where(eq(books.id, id))
  redirect('/')
}
