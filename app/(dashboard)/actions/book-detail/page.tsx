import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { books } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function BookDetailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const id = parseInt(params.id || '0', 10);
  
  const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
  
  if (result.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Book Not Found</h2>
        <Link href="/actions/book-add" className="text-blue-600 hover:underline">
          Add a new book
        </Link>
      </div>
    );
  }
  
  const book = result[0];

  const buttonStyle = 'bg-slate-800 text-stone-100 px-4 py-2 rounded hover:bg-slate-700 transition';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Book Details</h2>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-600">ID:</span>
            <span className="ml-2">{book.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">ISBN-13:</span>
            <span className="ml-2">{book.isbn13.toString().replace(/(\d{3})(\d{1})(\d{4})(\d{4})(\d{1})/, '$1-$2-$3-$4-$5')}</span>
          </div>
          <div className="col-span-2">
            <span className="font-medium text-gray-600">Title:</span>
            <span className="ml-2 text-lg">{book.title}</span>
          </div>
          <div className="col-span-2">
            <span className="font-medium text-gray-600">Author:</span>
            <span className="ml-2 text-lg">{book.author}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Pages:</span>
            <span className="ml-2">{book.pages}</span>
          </div>
          <div className="col-span-2">
            <span className="font-medium text-gray-600">Genres:</span>
            <span className="ml-2">{book.genres || 'None specified'}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex gap-4">
        <Link href="/actions/book-add" className={buttonStyle}>
          Add Another Book
        </Link>
        <Link href={`/actions/book-edit?id=${book.id}`} className={buttonStyle}>Edit</Link>
      </div>
    </div>
  );
}
