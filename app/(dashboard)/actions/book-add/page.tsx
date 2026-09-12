'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { addBook } from './actions'
import { useFormStatus } from 'react-dom'
import Button from '@/components/Button'
import GenreAutocomplete from '@/components/GenreAutocomplete'
import { useTranslations } from '@/i18n/I18nProvider'

interface Genre {
  id: number
  value: string
}

function SubmitButton() {
  const t = useTranslations()
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t('common.saving') : t('common.save')}
    </Button>
  )
}

export default function BookAddPage() {
  const t = useTranslations()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([])

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return <p>{t('common.loading')}</p>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">{t('bookAdd.heading')}</h2>

      <form action={addBook} className="max-w-lg">
        <fieldset className="border border-gray-300 rounded-md p-4 mb-6">
          <legend className="font-medium px-1">{t('book.details')}</legend>

          <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-start">
            <label htmlFor="title" className="md:w-40 font-medium pt-2">
              {t('book.title')}
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
              {t('book.author')}
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
              {t('book.pages')}
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
            <label className="md:w-40 font-medium pt-2">{t('book.genres')}</label>
            <div className="flex-1">
              <GenreAutocomplete selectedGenres={selectedGenres} onChange={setSelectedGenres} />
            </div>
          </div>

          <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-start">
            <label htmlFor="isbn13" className="md:w-40 font-medium pt-2">
              {t('book.isbn13')}
            </label>
            <input
              type="text"
              id="isbn13"
              name="isbn13"
              placeholder={t('book.isbn13Placeholder')}
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
