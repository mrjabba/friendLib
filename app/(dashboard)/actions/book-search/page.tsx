'use client';

import { useState, useTransition } from "react";
import { searchBooks } from "./actions";
import Link from 'next/link';

export default function BookSearch() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const results = await searchBooks(query);
      setBooks(results);
      setSearched(true);
    });
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Book Search</h2>

      <form onSubmit={handleSearch} className="mb-6">
        <fieldset className="border border-gray-300 rounded-md p-4 mb-4">
          <legend className="font-medium px-1">Details</legend>

          <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
            <label htmlFor="search" className="md:w-40 font-medium">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isPending}
          className="bg-slate-800 text-stone-100 px-4 py-2 rounded hover:bg-slate-700 transition disabled:opacity-50"
        >
          {isPending ? "Searching..." : "Search"}
        </button>
      </form>

      {searched && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Results ({books.length})</h3>
          {books.length === 0 ? (
            <p className="text-gray-500">No books found.</p>
          ) : (
            <ul className="space-y-4">
              {books.map((book) => (
                <li key={book.id} className="border border-gray-300 rounded-md p-4">
                  <h4 className="font-semibold text-lg">
                    <Link href={`/actions/book-detail?id=${book.id}`} className="text-blue-600 hover:underline">{book.title}</Link>
                  </h4>
                  <p className="text-gray-600"><strong>Author:</strong> {book.author}</p>
                  <p className="text-gray-600"><strong>Pages:</strong> {book.pages}</p>
                  <p className="text-gray-600"><strong>Genres:</strong> {book.genres}</p>
                  <p className="text-gray-600"><strong>ISBN:</strong> {book.isbn13}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
