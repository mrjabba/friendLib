'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import { confirmBookReturn, getPendingReturnConfirmations } from '../borrow/actions'
import { useI18n } from '@/i18n/I18nProvider'

interface PendingReturn {
  id: string
  bookId: number
  borrowerId: string
  returnedAt: Date | null
}

export default function ReturnConfirmationPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const [returns, setReturns] = useState<PendingReturn[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [bookTitles, setBookTitles] = useState<Record<number, string>>({})

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    async function fetchReturns() {
      const data = await getPendingReturnConfirmations()
      setReturns(data as PendingReturn[])
      setLoading(false)

      const bookIds = Array.from(new Set((data as PendingReturn[]).map((r) => r.bookId)))
      const titles: Record<number, string> = {}
      for (const bookId of bookIds) {
        try {
          const res = await fetch(`/api/books/${bookId}`)
          const json = await res.json()
          if (json.book) {
            titles[bookId] = json.book.title
          }
        } catch {
          titles[bookId] = t('book.unknownBook')
        }
      }
      setBookTitles(titles)
    }

    if (isSignedIn) {
      fetchReturns()
    }
  }, [isSignedIn])

  const handleConfirm = async (borrowId: string) => {
    setProcessing(borrowId)
    await confirmBookReturn(borrowId)
    router.refresh()
  }

  if (!isLoaded || loading) {
    return <p>{t('common.loading')}</p>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('returns.heading')}</h2>

      {returns.length === 0 ? (
        <p className="text-gray-600">{t('returns.empty')}</p>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <div key={ret.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {bookTitles[ret.bookId] || t('book.number', { id: ret.bookId })}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t('returns.returnedOn', {
                      date: ret.returnedAt
                        ? new Date(ret.returnedAt).toLocaleDateString(locale)
                        : t('common.unknown'),
                    })}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">{t('returns.borrowerMarked')}</p>
                </div>
                <Button onClick={() => handleConfirm(ret.id)} disabled={processing === ret.id}>
                  {processing === ret.id ? t('returns.confirming') : t('returns.confirm')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/">
          <Button>{t('common.backToHome')}</Button>
        </Link>
      </div>
    </div>
  )
}
