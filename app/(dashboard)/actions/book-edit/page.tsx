import Link from 'next/link';
import { getBookById, updateBook } from './actions';
import { SubmitButton } from './SubmitButton';
import Button from '@/components/Button';

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function BookEditPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const id = parseInt(params.id || '0', 10);
  const book = await getBookById(id);

  if (!book) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Book Not Found</h2>
        <p>Could not find the book you are looking for.</p>
      </div>
    );
  }

  const isbnFormatted = book.isbn13.toString().replace(/(\d{3})(\d{1})(\d{4})(\d{4})(\d{1})/, '$1-$2-$3-$4-$5');

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Edit Book</h2>
      
      <form action={updateBook} className="max-w-lg">
        <input type="hidden" name="id" value={book.id} />
        
        <fieldset className="border border-gray-300 rounded-md p-4 mb-6">
          <legend className="font-medium px-1">Book Details</legend>
        
          <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
            <label htmlFor="title" className="md:w-40 font-medium">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={book.title}
              required
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
          </div>
        
          <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
            <label htmlFor="author" className="md:w-40 font-medium">Author</label>
            <input
              type="text"
              id="author"
              name="author"
              defaultValue={book.author}
              required
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
          </div>
        
          <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
            <label htmlFor="pages" className="md:w-40 font-medium">Pages</label>
            <input
              type="number"
              id="pages"
              name="pages"
              defaultValue={book.pages}
              required
              min="1"
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
          </div>
        
          <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
            <label htmlFor="genres" className="md:w-40 font-medium">Genres</label>
            <input
              type="text"
              id="genres"
              name="genres"
              defaultValue={book.genres}
              placeholder="e.g., Fiction, Mystery, Sci-Fi"
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
          </div>
        
          <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
            <label htmlFor="isbn13" className="md:w-40 font-medium">ISBN-13</label>
            <input
              type="text"
              id="isbn13"
              name="isbn13"
              defaultValue={isbnFormatted}
              required
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
          </div>
        </fieldset>
      
      <div className="flex gap-4">
        <SubmitButton />
        <Link href="/">
          <Button>Cancel</Button>
        </Link>
      </div>
      </form>
    </>
  );
}
