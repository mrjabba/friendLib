'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import GenrePill from '@/components/GenrePill'
import DeleteButton from '@/components/DeleteButton'
import BorrowButton from '@/components/BorrowButton'
import ReturnButton from '@/components/ReturnButton'
import { deleteBook } from '../delete-actions'
import { requestBorrow, markBookReturned } from '../borrow/actions'

export default function BookDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded, user } = useUser()
  const [book, setBook] = useState<any>(null)
  const [genres, setGenres] = useState<any[]>([])
  const [borrowStatus, setBorrowStatus] = useState<'available' | 'borrowed' | 'pending' | null>(
    null,
  )
  const [activeBorrow, setActiveBorrow] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const id = searchParams.get('id')

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (id && isSignedIn) {
      fetch(`/api/books/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setBook(data.book)
          setGenres(data.genres || [])
          setBorrowStatus(data.borrowStatus || null)
          setActiveBorrow(data.activeBorrow || null)
          setLoading(false)
        })
        .catch(() => {
          setBook(null)
          setLoading(false)
        })
    }
  }, [id, isSignedIn])

  if (!isLoaded || loading) {
    return <p>Loading...</p>
  }

  if (!isSignedIn) {
    return null
  }

  if (!book) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Book Not Found</h2>
        <Link href="/actions/book-add" className="text-blue-600 hover:underline">
          Add a new book
        </Link>
      </div>
    )
  }

  const isbnFormatted = book.isbn13
    .toString()
    .replace(/(\d{3})(\d{1})(\d{4})(\d{4})(\d{1})/, '$1-$2-$3-$4-$5')

  const currentUserId = user?.id || null
  const isOwner = currentUserId === book.userId
  const isBorrower = activeBorrow?.borrowerId === currentUserId

  const getStatusMessage = () => {
    if (borrowStatus === 'borrowed' && activeBorrow) {
      if (isBorrower) {
        return { type: 'borrowed-by-you', message: 'You are currently borrowing this book' }
      }
      return { type: 'borrowed', message: 'This book is currently borrowed' }
    }
    if (borrowStatus === 'pending') {
      return { type: 'pending', message: 'There is a pending borrow request for this book' }
    }
    return null
  }

  const statusInfo = getStatusMessage()

  const canBorrow = !isOwner && borrowStatus === 'available'
  const canReturn = isBorrower && activeBorrow && !activeBorrow.returnedAt

  return (
    <div>
      <div className="flex gap-4">
        <img src="/images/book-empty-small.png" alt="logo-small" className="w-48 h-48" />
        <div>
          <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
          <p className="text-gray-600 mb-6">{book.author}</p>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">ISBN:</span>
                <span className="text-sm">{isbnFormatted}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Pages:</span>
                <span className="text-sm">{book.pages}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Owner:</span>
                <span className="text-sm">{book.ownerEmail || 'Unknown'}</span>
              </div>
              {statusInfo && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span
                    className={`text-sm ${
                      statusInfo.type === 'borrowed-by-you'
                        ? 'text-blue-600 font-medium'
                        : 'text-yellow-600'
                    }`}
                  >
                    {statusInfo.message}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        {genres.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((g: any) => (
                <GenrePill key={g.id} id={g.id} value={g.value} />
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 flex gap-4">
          {canBorrow && <BorrowButton onBorrow={requestBorrow} bookId={book.id} />}
          {canReturn && activeBorrow && (
            <ReturnButton onReturn={markBookReturned} borrowId={activeBorrow.id} />
          )}
        </div>

        <div className="flex gap-4">
          <Link href="/actions/book-add">
            <Button>Add Another Book</Button>
          </Link>
          {isOwner && (
            <>
              <Link href={`/actions/book-edit?id=${book.id}`}>
                <Button>Edit</Button>
              </Link>
              <DeleteButton id={book.id} deleteAction={deleteBook} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
