import { getBookById, getBookGenres, updateBook } from './actions'
import BookEditForm from './BookEditForm'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getT } from '@/i18n/dictionaries'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function BookEditPage({ searchParams }: PageProps) {
  const { t } = await getT()
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
        <h2 className="text-xl font-semibold mb-4">{t('book.notFound')}</h2>
        <p>{t('book.notFoundDetail')}</p>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">{t('bookEdit.heading')}</h2>

      <BookEditForm book={book} genres={bookGenres} />
    </>
  )
}
