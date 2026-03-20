'use server';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { books } from '@/db/schema';
import { redirect } from 'next/navigation';

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);

export async function addBook(formData: FormData) {
  const title = formData.get('title') as string;
  const author = formData.get('author') as string;
  const pages = parseInt(formData.get('pages') as string, 10);
  const genres = (formData.get('genres') as string) || '';
  const isbnInput = (formData.get('isbn13') as string).replace(/-/g, '');
  const isbn13 = parseInt(isbnInput, 10);

  const result = await db.insert(books).values({
    title,
    author,
    pages,
    genres,
    isbn13,
  }).returning({ id: books.id });

  redirect(`/actions/book-detail?id=${result[0].id}`);
}
