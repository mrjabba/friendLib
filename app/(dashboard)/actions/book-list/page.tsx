'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface Book {
  id: number
  isbn13: string
  title: string
  author: string
  pages: number
}

// Reusable BookList component - import this from pages that need it
export function BookListComponent({ books = [] }: { books: Book[] }) {
  const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined)
  console.log(`>> BookList start books`, books)

  function handleMouseOver(book: Book) {
    setSelectedBook(book)
  }

  function handleMouseOut() {
    setSelectedBook(undefined)
  }

  return (
    <div className="flex gap-8">
      {/* Content on left */}
      <div className="flex-1">
        <h2 className="text-stone-700 text-2xl font-bold mb-4">Books</h2>
        <ul className="text-slate-800 space-y-2">
          {books.map((book) => {
            return (
              <li
                key={book.isbn13}
                onMouseOver={() => handleMouseOver(book)}
                onMouseOut={() => handleMouseOut()}
              >
                {book.title}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Image on right */}
      <div className="flex-shrink-0">
        {selectedBook && (
          <div className="border border-gray-300 rounded-md p-4">
            <h3 className="font-semibold">{selectedBook.title}</h3>
            <p className="text-gray-600">{selectedBook.author}</p>
            <Link href={`/actions/book-detail?id=${selectedBook.id}`}>View Details</Link>
          </div>
        )}
      </div>
    </div>
  )
}

// Page component - redirects to search since this is legacy
export default function BookListPage() {
  return (
    <div>
      <h2 className="text-stone-700 text-2xl font-bold mb-4">Books</h2>
      <p className="text-gray-600 mb-4">Please use the search page to find books.</p>
      <Link href="/actions/book-search" className="text-blue-600 hover:underline">
        Go to Book Search
      </Link>
    </div>
  )
}
