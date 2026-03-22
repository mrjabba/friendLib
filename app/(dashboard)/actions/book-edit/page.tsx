import { getBookById, getBookGenres, updateBook } from './actions'
import BookEditForm from './BookEditForm'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function BookEditPage({ searchParams }: PageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

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
