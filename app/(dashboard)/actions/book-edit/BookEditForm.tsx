'use client'

import { updateBook } from './actions'
import { SubmitButton } from './SubmitButton'
import Button from '@/components/Button'
import DeleteButton from '@/components/DeleteButton'
import Link from 'next/link'
import GenreAutocomplete from '@/components/GenreAutocomplete'
import { useState } from 'react'

interface Genre {
  id: number
  value: string
}

interface Book {
  id: number
  title: string
  author: string
  pages: number
  isbn13: number
}

interface BookEditFormProps {
  book: Book
  genres: Genre[]
}

export default function BookEditForm({ book, genres }: BookEditFormProps) {
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>(genres)

  const isbnFormatted = book.isbn13
    .toString()
    .replace(/(\d{3})(\d{1})(\d{4})(\d{4})(\d{1})/, '$1-$2-$3-$4-$5')

  return (
    <form action={updateBook} className="max-w-lg">
      <input type="hidden" name="id" value={book.id} />

      <fieldset className="border border-gray-300 rounded-md p-4 mb-6">
        <legend className="font-medium px-1">Book Details</legend>

        <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-start">
          <label htmlFor="title" className="md:w-40 font-medium pt-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={book.title}
            required
            className="border border-gray-300 rounded px-3 py-2 flex-1"
          />
        </div>

        <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-start">
          <label htmlFor="author" className="md:w-40 font-medium pt-2">
            Author
          </label>
          <input
            type="text"
            id="author"
            name="author"
            defaultValue={book.author}
            required
            className="border border-gray-300 rounded px-3 py-2 flex-1"
          />
        </div>

        <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-start">
          <label htmlFor="pages" className="md:w-40 font-medium pt-2">
            Pages
          </label>
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

        <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-start">
          <label className="md:w-40 font-medium pt-2">Genres</label>
          <div className="flex-1">
            <GenreAutocomplete selectedGenres={selectedGenres} onChange={setSelectedGenres} />
          </div>
        </div>

        <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-start">
          <label htmlFor="isbn13" className="md:w-40 font-medium pt-2">
            ISBN-13
          </label>
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
        <DeleteButton id={book.id} />
      </div>
    </form>
  )
}
