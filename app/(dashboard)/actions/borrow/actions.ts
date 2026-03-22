'use server'

import { auth } from '@clerk/nextjs/server'
import {
  createBorrowRequest,
  getActiveBorrowForBook,
  getPendingRequestForBook,
  getBookBorrowStatus,
  getBorrowById,
  approveBorrow,
  rejectBorrow,
  markReturned,
  confirmReturn,
  getPendingReturns,
  getBorrowsByOwner,
  getBorrowsByBorrower,
  type BorrowStatus,
} from '@/db/queries'
import { getBookWithGenres } from '@/db/queries'
import { getUserById } from '@/lib/users'
import {
  notifyBorrowRequest,
  notifyRequestApproved,
  notifyRequestRejected,
  notifyReturnPending,
  notifyReturnConfirmed,
} from '@/lib/email'

export { type BorrowStatus }

export interface BorrowRequestResult {
  success: boolean
  error?: string
  borrowId?: string
}

export async function requestBorrow(bookId: number): Promise<BorrowRequestResult> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: 'You must be logged in to request a book' }
  }

  const book = await getBookWithGenres(bookId)
  if (!book) {
    return { success: false, error: 'Book not found' }
  }

  if (book.userId === userId) {
    return { success: false, error: 'You cannot borrow your own book' }
  }

  const status = await getBookBorrowStatus(bookId)
  if (status === 'borrowed') {
    return { success: false, error: 'Book is currently borrowed' }
  }

  if (status === 'pending') {
    return { success: false, error: 'There is already a pending request for this book' }
  }

  const borrower = await getUserById(userId)
  const owner = await getUserById(book.userId)

  const borrow = await createBorrowRequest(bookId, book.userId, userId)

  if (borrow && owner?.email && borrower?.name) {
    await notifyBorrowRequest({
      ownerEmail: owner.email,
      ownerName: owner.name || 'Owner',
      borrowerName: borrower.name,
      bookTitle: book.title,
      bookId,
    }).catch(console.error)
  }

  return { success: true, borrowId: borrow?.id }
}

export async function approveBorrowRequest(borrowId: string): Promise<BorrowRequestResult> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  const borrow = await getBorrowById(borrowId)
  if (!borrow) {
    return { success: false, error: 'Borrow request not found' }
  }

  if (borrow.ownerId !== userId) {
    return { success: false, error: 'Only the owner can approve requests' }
  }

  if (borrow.approvedAt) {
    return { success: false, error: 'Request already approved' }
  }

  if (borrow.rejectedAt) {
    return { success: false, error: 'Request was already rejected' }
  }

  const updated = await approveBorrow(borrowId, userId)
  if (!updated) {
    return { success: false, error: 'Failed to approve request' }
  }

  const book = await getBookWithGenres(borrow.bookId)
  const borrower = await getUserById(borrow.borrowerId)
  const owner = await getUserById(userId)

  if (book && borrower?.email && owner?.name) {
    await notifyRequestApproved({
      borrowerEmail: borrower.email,
      borrowerName: borrower.name || 'Borrower',
      ownerName: owner.name,
      bookTitle: book.title,
    }).catch(console.error)
  }

  return { success: true }
}

export async function rejectBorrowRequest(borrowId: string): Promise<BorrowRequestResult> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  const borrow = await getBorrowById(borrowId)
  if (!borrow) {
    return { success: false, error: 'Borrow request not found' }
  }

  if (borrow.ownerId !== userId) {
    return { success: false, error: 'Only the owner can reject requests' }
  }

  if (borrow.approvedAt) {
    return { success: false, error: 'Request already approved' }
  }

  if (borrow.rejectedAt) {
    return { success: false, error: 'Request was already rejected' }
  }

  const updated = await rejectBorrow(borrowId, userId)
  if (!updated) {
    return { success: false, error: 'Failed to reject request' }
  }

  const book = await getBookWithGenres(borrow.bookId)
  const borrower = await getUserById(borrow.borrowerId)
  const owner = await getUserById(userId)

  if (book && borrower?.email && owner?.name) {
    await notifyRequestRejected({
      borrowerEmail: borrower.email,
      borrowerName: borrower.name || 'Borrower',
      ownerName: owner.name,
      bookTitle: book.title,
    }).catch(console.error)
  }

  return { success: true }
}

export async function markBookReturned(borrowId: string): Promise<BorrowRequestResult> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  const borrow = await getBorrowById(borrowId)
  if (!borrow) {
    return { success: false, error: 'Borrow request not found' }
  }

  if (borrow.borrowerId !== userId) {
    return { success: false, error: 'Only the borrower can mark the book as returned' }
  }

  if (!borrow.approvedAt) {
    return { success: false, error: 'Cannot mark as returned before the request is approved' }
  }

  if (borrow.returnedAt) {
    return { success: false, error: 'Book already marked as returned' }
  }

  const updated = await markReturned(borrowId, userId)
  if (!updated) {
    return { success: false, error: 'Failed to mark book as returned' }
  }

  const book = await getBookWithGenres(borrow.bookId)
  const borrower = await getUserById(userId)
  const owner = await getUserById(borrow.ownerId)

  if (book && owner?.email && borrower?.name) {
    await notifyReturnPending({
      ownerEmail: owner.email,
      ownerName: owner.name || 'Owner',
      borrowerName: borrower.name,
      bookTitle: book.title,
    }).catch(console.error)
  }

  return { success: true }
}

export async function confirmBookReturn(borrowId: string): Promise<BorrowRequestResult> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  const borrow = await getBorrowById(borrowId)
  if (!borrow) {
    return { success: false, error: 'Borrow request not found' }
  }

  if (borrow.ownerId !== userId) {
    return { success: false, error: 'Only the owner can confirm returns' }
  }

  if (!borrow.returnedAt) {
    return {
      success: false,
      error: 'Cannot confirm return before the borrower marks the book as returned',
    }
  }

  if (borrow.ownerConfirmedReturnAt) {
    return { success: false, error: 'Return already confirmed' }
  }

  const updated = await confirmReturn(borrowId, userId)
  if (!updated) {
    return { success: false, error: 'Failed to confirm return' }
  }

  const book = await getBookWithGenres(borrow.bookId)
  const owner = await getUserById(userId)
  const borrower = await getUserById(borrow.borrowerId)

  if (book && borrower?.email && owner?.name) {
    await notifyReturnConfirmed({
      borrowerEmail: borrower.email,
      borrowerName: borrower.name || 'Borrower',
      ownerName: owner.name,
      bookTitle: book.title,
    }).catch(console.error)
  }

  return { success: true }
}

export async function getBookStatus(bookId: number): Promise<BorrowStatus> {
  return getBookBorrowStatus(bookId)
}

export async function getIncomingBorrowRequests() {
  const { userId } = await auth()
  if (!userId) return []

  const borrows = await getBorrowsByOwner(userId)
  return borrows.filter((b) => !b.approvedAt && !b.rejectedAt)
}

export async function getMyBorrows() {
  const { userId } = await auth()
  if (!userId) return []

  const borrows = await getBorrowsByBorrower(userId)
  return borrows
}

export async function getPendingReturnConfirmations() {
  const { userId } = await auth()
  if (!userId) return []

  return getPendingReturns(userId)
}
