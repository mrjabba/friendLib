'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { searchBooks } from './actions'
import { deleteBook } from '../delete-actions'
import Link from 'next/link'
import Button from '@/components/Button'
import DeleteButton from '@/components/DeleteButton'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from '@/i18n/I18nProvider'

export default function BookSearch() {
  const t = useTranslations()
  const router = useRouter()
  const { isSignedIn, isLoaded, user } = useUser()
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState<any[]>([])
  const [searched, setSearched] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!isLoaded) {
    return <p>{t('common.loading')}</p>
  }

  if (!isSignedIn) {
    router.push('/sign-in')
    return null
  }

  const currentUserId = user?.id || null

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const results = await searchBooks(query)
      setBooks(results)
      setSearched(true)
    })
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">{t('search.heading')}</h2>

      <form onSubmit={handleSearch} className="mb-6">
        <fieldset className="border border-gray-300 rounded-md p-4 mb-4">
          <legend className="font-medium px-1">{t('search.details')}</legend>

          <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
            <label htmlFor="search" className="md:w-40 font-medium">
              {t('search.label')}
            </label>
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

        <Button type="submit" disabled={isPending}>
          {isPending ? t('search.searching') : t('search.submit')}
        </Button>
      </form>

      {searched && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">
            {t('search.results', { count: books.length })}
          </h3>
          {books.length === 0 ? (
            <p className="text-gray-500">{t('search.noBooks')}</p>
          ) : (
            <ul className="space-y-4">
              {books.map((book) => {
                const isOwner = currentUserId === String(book.userId)
                return (
                  <li key={book.id} className="border border-gray-300 rounded-md p-4">
                    <h4 className="font-semibold text-lg">
                      <Link
                        href={`/actions/book-detail?id=${book.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {book.title}
                      </Link>
                    </h4>
                    <p className="text-gray-600">
                      <strong>{t('book.author')}:</strong> {book.author}
                    </p>
                    <p className="text-gray-600">
                      <strong>{t('book.pages')}:</strong> {book.pages}
                    </p>
                    <p className="text-gray-600">
                      <strong>{t('book.isbn')}:</strong> {book.isbn13}
                    </p>
                    <p className="text-gray-600">
                      <strong>{t('book.owner')}:</strong> {book.ownerEmail || t('common.unknown')}
                    </p>
                    {isOwner && (
                      <div className="mt-2">
                        <Link
                          href={`/actions/book-edit?id=${book.id}`}
                          className="text-blue-600 hover:underline mr-4"
                        >
                          {t('common.edit')}
                        </Link>
                        <DeleteButton id={book.id} variant="primary" deleteAction={deleteBook} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </>
  )
}
