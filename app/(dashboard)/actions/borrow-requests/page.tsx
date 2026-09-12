'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import {
  approveBorrowRequest,
  rejectBorrowRequest,
  getIncomingBorrowRequests,
} from '../borrow/actions'
import { useI18n } from '@/i18n/I18nProvider'

interface BorrowRequest {
  id: string
  bookId: number
  borrowerId: string
  requestedAt: Date | null
}

export default function BorrowRequestsPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const [requests, setRequests] = useState<BorrowRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [bookTitles, setBookTitles] = useState<Record<number, string>>({})

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    async function fetchRequests() {
      const data = await getIncomingBorrowRequests()
      setRequests(data as BorrowRequest[])
      setLoading(false)

      const bookIds = Array.from(new Set((data as BorrowRequest[]).map((r) => r.bookId)))
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
      fetchRequests()
    }
  }, [isSignedIn])

  const handleApprove = async (borrowId: string) => {
    setProcessing(borrowId)
    await approveBorrowRequest(borrowId)
    router.refresh()
  }

  const handleReject = async (borrowId: string) => {
    setProcessing(borrowId)
    await rejectBorrowRequest(borrowId)
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
      <h2 className="text-2xl font-bold mb-6">{t('requests.heading')}</h2>

      {requests.length === 0 ? (
        <p className="text-gray-600">{t('requests.empty')}</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {bookTitles[request.bookId] || t('book.number', { id: request.bookId })}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t('borrows.requested', {
                      date: request.requestedAt
                        ? new Date(request.requestedAt).toLocaleDateString(locale)
                        : t('common.unknown'),
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing === request.id}
                  >
                    {t('requests.approve')}
                  </Button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processing === request.id}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {t('requests.reject')}
                  </button>
                </div>
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
