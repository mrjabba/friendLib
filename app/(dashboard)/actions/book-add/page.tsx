'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { addBook } from './actions'
import { useFormStatus } from 'react-dom'
import Button from '@/components/Button'
import GenreAutocomplete from '@/components/GenreAutocomplete'

interface Genre {
  id: number
  value: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save'}
    </Button>
  )
}

export default function BookAddPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([])

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return <p>Loading...</p>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Add Book</h2>

      <form action={addBook} className="max-w-lg">
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
              placeholder="e.g., 978-0-13-468599-1"
              required
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
          </div>
        </fieldset>

        <SubmitButton />
      </form>
    </>
  )
}
