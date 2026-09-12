'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import ReturnButton from '@/components/ReturnButton'
import { getMyBorrows, markBookReturned } from '../borrow/actions'
import { useI18n } from '@/i18n/I18nProvider'

interface MyBorrow {
  id: string
  bookId: number
  ownerId: string
  requestedAt: Date | null
  approvedAt: Date | null
  rejectedAt: Date | null
  returnedAt: Date | null
  ownerConfirmedReturnAt: Date | null
}

export default function MyBorrowsPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const [borrows, setBorrows] = useState<MyBorrow[]>([])
  const [loading, setLoading] = useState(true)
  const [bookTitles, setBookTitles] = useState<Record<number, string>>({})

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    async function fetchBorrows() {
      const data = await getMyBorrows()
      setBorrows(data as MyBorrow[])
      setLoading(false)

      const bookIds = Array.from(new Set((data as MyBorrow[]).map((b) => b.bookId)))
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
      fetchBorrows()
    }
  }, [isSignedIn])

  const getStatus = (borrow: MyBorrow) => {
    if (borrow.ownerConfirmedReturnAt)
      return { label: t('borrows.status.returnedConfirmed'), color: 'text-green-600' }
    if (borrow.returnedAt)
      return { label: t('borrows.status.returnedPending'), color: 'text-blue-600' }
    if (borrow.rejectedAt) return { label: t('borrows.status.rejected'), color: 'text-red-600' }
    if (borrow.approvedAt) return { label: t('borrows.status.approved'), color: 'text-green-600' }
    return { label: t('borrows.status.pendingApproval'), color: 'text-yellow-600' }
  }

  if (!isLoaded || loading) {
    return <p>{t('common.loading')}</p>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('borrows.heading')}</h2>

      {borrows.length === 0 ? (
        <p className="text-gray-600">{t('borrows.empty')}</p>
      ) : (
        <div className="space-y-4">
          {borrows.map((borrow) => {
            const status = getStatus(borrow)
            const canReturn = borrow.approvedAt && !borrow.returnedAt

            return (
              <div key={borrow.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {bookTitles[borrow.bookId] || t('book.number', { id: borrow.bookId })}
                    </h3>
                    <p className={`text-sm ${status.color}`}>{status.label}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {t('borrows.requested', {
                        date: borrow.requestedAt
                          ? new Date(borrow.requestedAt).toLocaleDateString(locale)
                          : t('common.unknown'),
                      })}
                    </p>
                  </div>
                  {canReturn && <ReturnButton onReturn={markBookReturned} borrowId={borrow.id} />}
                </div>
              </div>
            )
          })}
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
