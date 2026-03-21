import Link from 'next/link'
import { getBookById, getBookGenres, updateBook } from './actions'
import { SubmitButton } from './SubmitButton'
import Button from '@/components/Button'
import BookEditForm from './BookEditForm'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function BookEditPage({ searchParams }: PageProps) {
  const params = await searchParams
  const id = parseInt(params.id || '0', 10)
  const book = await getBookById(id)
  const bookGenres = await getBookGenres(id)

  if (!book) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Book Not Found</h2>
        <p>Could not find the book you are looking for.</p>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Edit Book</h2>

      <BookEditForm book={book} genres={bookGenres} />
    </>
  )
}
