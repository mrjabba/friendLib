import Link from 'next/link'
import { getGenreById } from '../actions'
import { db } from '@/db'
import { books, bookGenre } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Button from '@/components/Button'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getT } from '@/i18n/dictionaries'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BooksByGenrePage({ params }: PageProps) {
  const { t } = await getT()
  const { id } = await params
  const genreId = parseInt(id, 10)
  const genreInfo = await getGenreById(genreId)
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  if (!genreInfo) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('genre.notFound')}</h2>
        <Link href="/" className="text-blue-600 hover:underline">
          {t('common.backToDashboard')}
        </Link>
      </div>
    )
  }

  const booksWithGenres = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      pages: books.pages,
      isbn13: books.isbn13,
      userId: books.userId,
    })
    .from(books)
    .innerJoin(bookGenre, eq(books.id, bookGenre.bookId))
    .where(eq(bookGenre.genreId, genreId))

  const currentUserId = userId || null

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          &larr; {t('common.backToDashboard')}
        </Link>
        <h2 className="text-2xl font-bold">{t('genre.booksIn', { genre: genreInfo.value })}</h2>
        <p className="text-gray-600">{t('book.count', { count: booksWithGenres.length })}</p>
      </div>

      {booksWithGenres.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('book.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('book.author')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('book.pages')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('book.isbn')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {booksWithGenres.map((book) => {
                const isOwner = currentUserId === book.userId
                return (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{book.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{book.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{book.pages}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-sm">
                      {book.isbn13
                        .toString()
                        .replace(/(\d{3})(\d{1})(\d{4})(\d{4})(\d{1})/, '$1-$2-$3-$4-$5')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link href={`/actions/book-detail?id=${book.id}`}>
                        <Button className="mr-2">{t('common.view')}</Button>
                      </Link>
                      {isOwner && (
                        <Link href={`/actions/book-edit?id=${book.id}`}>
                          <Button>{t('common.edit')}</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">{t('genre.noBooksIn')}</p>
      )}
    </div>
  )
}
