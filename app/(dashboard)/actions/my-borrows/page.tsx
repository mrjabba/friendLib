'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import ReturnButton from '@/components/ReturnButton'
import { getMyBorrows, markBookReturned } from '../borrow/actions'

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
          titles[bookId] = 'Unknown Book'
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
      return { label: 'Returned & Confirmed', color: 'text-green-600' }
    if (borrow.returnedAt)
      return { label: 'Returned - Pending Confirmation', color: 'text-blue-600' }
    if (borrow.rejectedAt) return { label: 'Request Rejected', color: 'text-red-600' }
    if (borrow.approvedAt) return { label: 'Approved - Borrowed', color: 'text-green-600' }
    return { label: 'Pending Approval', color: 'text-yellow-600' }
  }

  if (!isLoaded || loading) {
    return <p>Loading...</p>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Borrows</h2>

      {borrows.length === 0 ? (
        <p className="text-gray-600">You haven&apos;t borrowed any books yet.</p>
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
                      {bookTitles[borrow.bookId] || `Book #${borrow.bookId}`}
                    </h3>
                    <p className={`text-sm ${status.color}`}>{status.label}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Requested:{' '}
                      {borrow.requestedAt
                        ? new Date(borrow.requestedAt).toLocaleDateString()
                        : 'Unknown'}
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
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
