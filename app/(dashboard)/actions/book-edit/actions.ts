'use server';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { books } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);

export async function getBookById(id: number) {
  const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return result[0] || null;
}

export async function updateBook(formData: FormData) {
  const id = parseInt(formData.get('id') as string, 10);
  const title = formData.get('title') as string;
  const author = formData.get('author') as string;
  const pages = parseInt(formData.get('pages') as string, 10);
  const genres = (formData.get('genres') as string) || '';
  const isbnInput = (formData.get('isbn13') as string).replace(/-/g, '');
  const isbn13 = parseInt(isbnInput, 10);

  await db.update(books)
    .set({ title, author, pages, genres, isbn13 })
    .where(eq(books.id, id));

  redirect(`/actions/book-detail?id=${id}`);
}
