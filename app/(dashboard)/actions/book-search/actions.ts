'use server'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { books } from '@/db/schema'
import { ilike, or } from 'drizzle-orm'

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`)
const db = drizzle(client)

export async function searchBooks(query: string) {
  if (!query || query.trim() === '') {
    return []
  }

  const results = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      pages: books.pages,
      isbn13: books.isbn13,
      userId: books.userId,
    })
    .from(books)
    .where(or(ilike(books.title, `%${query}%`), ilike(books.author, `%${query}%`)))
    .limit(20)

  return results
}

export async function getAllBooksWithOwners() {
  const results = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      pages: books.pages,
      isbn13: books.isbn13,
      userId: books.userId,
    })
    .from(books)

  return results
}
