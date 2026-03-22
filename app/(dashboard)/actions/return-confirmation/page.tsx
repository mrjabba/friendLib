'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import { confirmBookReturn, getPendingReturnConfirmations } from '../borrow/actions'

interface PendingReturn {
  id: string
  bookId: number
  borrowerId: string
  returnedAt: Date | null
}

export default function ReturnConfirmationPage() {
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
          titles[bookId] = 'Unknown Book'
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
    return <p>Loading...</p>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Confirm Returns</h2>

      {returns.length === 0 ? (
        <p className="text-gray-600">No returns pending confirmation.</p>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <div key={ret.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {bookTitles[ret.bookId] || `Book #${ret.bookId}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Returned:{' '}
                    {ret.returnedAt ? new Date(ret.returnedAt).toLocaleDateString() : 'Unknown'}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">Borrower marked this as returned</p>
                </div>
                <Button onClick={() => handleConfirm(ret.id)} disabled={processing === ret.id}>
                  {processing === ret.id ? 'Confirming...' : 'Confirm Return'}
                </Button>
              </div>
            </div>
          ))}
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
