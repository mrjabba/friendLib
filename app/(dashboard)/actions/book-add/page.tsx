'use client';
import { addBook } from './actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-slate-800 text-stone-100 px-4 py-2 rounded hover:bg-slate-700 transition disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Save'}
    </button>
  );
}

export default function BookAddPage() {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Add Book</h2>
      
      <form action={addBook} className="max-w-lg">
        <fieldset className="border border-gray-300 rounded-md p-4 mb-6">
          <legend className="font-medium px-1">Book Details</legend>
        
          <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
            <label htmlFor="title" className="md:w-40 font-medium">Title</label>
            <input
              type="text"
              id="title"
              name="title"
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
              placeholder="e.g., 978-0-13-468599-1"
              required
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
          </div>
        </fieldset>
      
        <SubmitButton />
      </form>
    </>
  );
}
