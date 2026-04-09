import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock auth before importing the module under test
const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}))

const { mockGetUserById } = vi.hoisted(() => ({
  mockGetUserById: vi.fn(),
}))

const { mockGetBookWithGenres } = vi.hoisted(() => ({
  mockGetBookWithGenres: vi.fn(),
}))

const { mockGetBookBorrowStatus } = vi.hoisted(() => ({
  mockGetBookBorrowStatus: vi.fn(),
}))

const { mockCreateBorrowRequest } = vi.hoisted(() => ({
  mockCreateBorrowRequest: vi.fn(),
}))

const { mockGetBorrowById } = vi.hoisted(() => ({
  mockGetBorrowById: vi.fn(),
}))

const { mockApproveBorrow } = vi.hoisted(() => ({
  mockApproveBorrow: vi.fn(),
}))

const { mockRejectBorrow } = vi.hoisted(() => ({
  mockRejectBorrow: vi.fn(),
}))

const { mockMarkReturned } = vi.hoisted(() => ({
  mockMarkReturned: vi.fn(),
}))

const { mockConfirmReturn } = vi.hoisted(() => ({
  mockConfirmReturn: vi.fn(),
}))

const { mockGetBorrowsByOwner } = vi.hoisted(() => ({
  mockGetBorrowsByOwner: vi.fn(),
}))

const { mockGetBorrowsByBorrower } = vi.hoisted(() => ({
  mockGetBorrowsByBorrower: vi.fn(),
}))

const { mockGetPendingReturns } = vi.hoisted(() => ({
  mockGetPendingReturns: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}))

vi.mock('@/lib/users', () => ({
  getUserById: mockGetUserById,
}))

vi.mock('@/db/queries', () => ({
  getBookWithGenres: mockGetBookWithGenres,
  getBookBorrowStatus: mockGetBookBorrowStatus,
  createBorrowRequest: mockCreateBorrowRequest,
  getBorrowById: mockGetBorrowById,
  approveBorrow: mockApproveBorrow,
  rejectBorrow: mockRejectBorrow,
  markReturned: mockMarkReturned,
  confirmReturn: mockConfirmReturn,
  getBorrowsByOwner: mockGetBorrowsByOwner,
  getBorrowsByBorrower: mockGetBorrowsByBorrower,
  getPendingReturns: mockGetPendingReturns,
}))

vi.mock('@/lib/email', () => ({
  notifyBorrowRequest: async () => {},
  notifyRequestApproved: async () => {},
  notifyRequestRejected: async () => {},
  notifyReturnPending: async () => {},
  notifyReturnConfirmed: async () => {},
}))

// Import after setting up mocks
import {
  requestBorrow,
  approveBorrowRequest,
  rejectBorrowRequest,
  markBookReturned,
  confirmBookReturn,
  getBookStatus,
  getIncomingBorrowRequests,
  getMyBorrows,
  getPendingReturnConfirmations,
  type BorrowStatus,
} from './actions'

describe('borrow actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Test data
  const mockBook = {
    id: 1,
    title: 'Test Book',
    userId: 'owner_123',
    isbn: '978-0-123456-78-9',
  }

  const mockOwner = { id: 'owner_123', email: 'owner@test.com', name: 'Owner User' }
  const mockBorrower = { id: 'borrower_456', email: 'borrower@test.com', name: 'Borrower User' }

  const mockBorrowRecord = {
    id: 'borrow_789',
    bookId: 1,
    ownerId: 'owner_123',
    borrowerId: 'borrower_456',
    approvedAt: null,
    rejectedAt: null,
    returnedAt: null,
    ownerConfirmedReturnAt: null,
  }

  describe('requestBorrow', () => {
    it('returns error when user not logged in', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await requestBorrow(1)

      expect(result).toEqual({
        success: false,
        error: 'You must be logged in to request a book',
      })
    })

    it('returns error when book not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'borrower_456' })
      mockGetBookWithGenres.mockResolvedValue(null)

      const result = await requestBorrow(999)

      expect(result).toEqual({
        success: false,
        error: 'Book not found',
      })
    })

    it('returns error when trying to borrow own book', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBookWithGenres.mockResolvedValue(mockBook)

      const result = await requestBorrow(1)

      expect(result).toEqual({
        success: false,
        error: 'You cannot borrow your own book',
      })
    })

    it('returns error when book is already borrowed', async () => {
      mockAuth.mockResolvedValue({ userId: 'borrower_456' })
      mockGetBookWithGenres.mockResolvedValue(mockBook)
      mockGetBookBorrowStatus.mockResolvedValue('borrowed')

      const result = await requestBorrow(1)

      expect(result).toEqual({
        success: false,
        error: 'Book is currently borrowed',
      })
    })

    it('returns error when there is already a pending request', async () => {
      mockAuth.mockResolvedValue({ userId: 'borrower_456' })
      mockGetBookWithGenres.mockResolvedValue(mockBook)
      mockGetBookBorrowStatus.mockResolvedValue('pending')

      const result = await requestBorrow(1)

      expect(result).toEqual({
        success: false,
        error: 'There is already a pending request for this book',
      })
    })

    it('successfully requests to borrow a book', async () => {
      mockAuth.mockResolvedValue({ userId: 'borrower_456' })
      mockGetBookWithGenres.mockResolvedValue(mockBook)
      mockGetBookBorrowStatus.mockResolvedValue('available')
      mockGetUserById.mockResolvedValueOnce(mockBorrower).mockResolvedValueOnce(mockOwner)
      mockCreateBorrowRequest.mockResolvedValue({ id: 'borrow_789' })

      const result = await requestBorrow(1)

      expect(result).toEqual({
        success: true,
        borrowId: 'borrow_789',
      })
    })
  })

  describe('approveBorrowRequest', () => {
    it('returns error when user not logged in', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await approveBorrowRequest('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'You must be logged in',
      })
    })

    it('returns error when borrow not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue(null)

      const result = await approveBorrowRequest('invalid')

      expect(result).toEqual({
        success: false,
        error: 'Borrow request not found',
      })
    })

    it('returns error when non-owner tries to approve', async () => {
      mockAuth.mockResolvedValue({ userId: 'other_user' })
      mockGetBorrowById.mockResolvedValue(mockBorrowRecord)

      const result = await approveBorrowRequest('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Only the owner can approve requests',
      })
    })

    it('returns error when already approved', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue({
        ...mockBorrowRecord,
        approvedAt: new Date(),
      })

      const result = await approveBorrowRequest('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Request already approved',
      })
    })

    it('returns error when already rejected', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue({
        ...mockBorrowRecord,
        rejectedAt: new Date(),
      })

      const result = await approveBorrowRequest('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Request was already rejected',
      })
    })

    it('successfully approves a borrow request', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue(mockBorrowRecord)
      mockApproveBorrow.mockResolvedValue(true)
      mockGetBookWithGenres.mockResolvedValue(mockBook)
      mockGetUserById.mockResolvedValueOnce(mockBorrower).mockResolvedValueOnce(mockOwner)

      const result = await approveBorrowRequest('borrow_789')

      expect(result).toEqual({ success: true })
    })
  })

  describe('rejectBorrowRequest', () => {
    it('returns error when user not logged in', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await rejectBorrowRequest('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'You must be logged in',
      })
    })

    it('returns error when borrow not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue(null)

      const result = await rejectBorrowRequest('invalid')

      expect(result).toEqual({
        success: false,
        error: 'Borrow request not found',
      })
    })

    it('returns error when non-owner tries to reject', async () => {
      mockAuth.mockResolvedValue({ userId: 'other_user' })
      mockGetBorrowById.mockResolvedValue(mockBorrowRecord)

      const result = await rejectBorrowRequest('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Only the owner can reject requests',
      })
    })

    it('returns error when already approved', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue({
        ...mockBorrowRecord,
        approvedAt: new Date(),
      })

      const result = await rejectBorrowRequest('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Request already approved',
      })
    })

    it('returns error when already rejected', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue({
        ...mockBorrowRecord,
        rejectedAt: new Date(),
      })

      const result = await rejectBorrowRequest('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Request was already rejected',
      })
    })

    it('successfully rejects a borrow request', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue(mockBorrowRecord)
      mockRejectBorrow.mockResolvedValue(true)
      mockGetBookWithGenres.mockResolvedValue(mockBook)
      mockGetUserById.mockResolvedValueOnce(mockBorrower).mockResolvedValueOnce(mockOwner)

      const result = await rejectBorrowRequest('borrow_789')

      expect(result).toEqual({ success: true })
    })
  })

  describe('markBookReturned', () => {
    const approvedBorrowRecord = {
      ...mockBorrowRecord,
      approvedAt: new Date(),
    }

    it('returns error when user not logged in', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await markBookReturned('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'You must be logged in',
      })
    })

    it('returns error when borrow not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'borrower_456' })
      mockGetBorrowById.mockResolvedValue(null)

      const result = await markBookReturned('invalid')

      expect(result).toEqual({
        success: false,
        error: 'Borrow request not found',
      })
    })

    it('returns error when non-borrower tries to mark returned', async () => {
      mockAuth.mockResolvedValue({ userId: 'other_user' })
      mockGetBorrowById.mockResolvedValue(approvedBorrowRecord)

      const result = await markBookReturned('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Only the borrower can mark the book as returned',
      })
    })

    it('returns error when request not approved', async () => {
      mockAuth.mockResolvedValue({ userId: 'borrower_456' })
      mockGetBorrowById.mockResolvedValue(mockBorrowRecord)

      const result = await markBookReturned('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Cannot mark as returned before the request is approved',
      })
    })

    it('returns error when already returned', async () => {
      mockAuth.mockResolvedValue({ userId: 'borrower_456' })
      mockGetBorrowById.mockResolvedValue({
        ...approvedBorrowRecord,
        returnedAt: new Date(),
      })

      const result = await markBookReturned('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Book already marked as returned',
      })
    })

    it('successfully marks book as returned', async () => {
      mockAuth.mockResolvedValue({ userId: 'borrower_456' })
      mockGetBorrowById.mockResolvedValue(approvedBorrowRecord)
      mockMarkReturned.mockResolvedValue(true)
      mockGetBookWithGenres.mockResolvedValue(mockBook)
      mockGetUserById.mockResolvedValueOnce(mockBorrower).mockResolvedValueOnce(mockOwner)

      const result = await markBookReturned('borrow_789')

      expect(result).toEqual({ success: true })
    })
  })

  describe('confirmBookReturn', () => {
    const returnedBorrowRecord = {
      ...mockBorrowRecord,
      approvedAt: new Date(),
      returnedAt: new Date(),
    }

    it('returns error when user not logged in', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await confirmBookReturn('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'You must be logged in',
      })
    })

    it('returns error when borrow not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue(null)

      const result = await confirmBookReturn('invalid')

      expect(result).toEqual({
        success: false,
        error: 'Borrow request not found',
      })
    })

    it('returns error when non-owner tries to confirm return', async () => {
      mockAuth.mockResolvedValue({ userId: 'other_user' })
      mockGetBorrowById.mockResolvedValue(returnedBorrowRecord)

      const result = await confirmBookReturn('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Only the owner can confirm returns',
      })
    })

    it('returns error when book not marked as returned', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue({
        ...mockBorrowRecord,
        approvedAt: new Date(),
        returnedAt: null,
      })

      const result = await confirmBookReturn('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Cannot confirm return before the borrower marks the book as returned',
      })
    })

    it('returns error when return already confirmed', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue({
        ...returnedBorrowRecord,
        ownerConfirmedReturnAt: new Date(),
      })

      const result = await confirmBookReturn('borrow_789')

      expect(result).toEqual({
        success: false,
        error: 'Return already confirmed',
      })
    })

    it('successfully confirms book return', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      mockGetBorrowById.mockResolvedValue(returnedBorrowRecord)
      mockConfirmReturn.mockResolvedValue(true)
      mockGetBookWithGenres.mockResolvedValue(mockBook)
      mockGetUserById.mockResolvedValueOnce(mockOwner).mockResolvedValueOnce(mockBorrower)

      const result = await confirmBookReturn('borrow_789')

      expect(result).toEqual({ success: true })
    })
  })

  describe('getBookStatus', () => {
    it('returns borrow status for a book', async () => {
      mockGetBookBorrowStatus.mockResolvedValue('borrowed' as BorrowStatus)

      const result = await getBookStatus(1)

      expect(result).toBe('borrowed')
    })
  })

  describe('getIncomingBorrowRequests', () => {
    it('returns empty array when user not logged in', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await getIncomingBorrowRequests()

      expect(result).toEqual([])
    })

    it('returns pending requests for the owner', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      const pendingBorrows = [
        { ...mockBorrowRecord, approvedAt: null, rejectedAt: null },
        { ...mockBorrowRecord, id: 'borrow_2', approvedAt: null, rejectedAt: null },
      ]
      mockGetBorrowsByOwner.mockResolvedValue(pendingBorrows)

      const result = await getIncomingBorrowRequests()

      expect(result).toHaveLength(2)
    })

    it('filters out approved and rejected requests', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      const mixedBorrows = [
        { ...mockBorrowRecord, approvedAt: null, rejectedAt: null },
        { ...mockBorrowRecord, id: 'borrow_2', approvedAt: new Date(), rejectedAt: null },
        { ...mockBorrowRecord, id: 'borrow_3', approvedAt: null, rejectedAt: new Date() },
      ]
      mockGetBorrowsByOwner.mockResolvedValue(mixedBorrows)

      const result = await getIncomingBorrowRequests()

      expect(result).toHaveLength(1)
    })
  })

  describe('getMyBorrows', () => {
    it('returns empty array when user not logged in', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await getMyBorrows()

      expect(result).toEqual([])
    })

    it('returns borrows for the borrower', async () => {
      mockAuth.mockResolvedValue({ userId: 'borrower_456' })
      const borrows = [
        { ...mockBorrowRecord, borrowerId: 'borrower_456' },
        { ...mockBorrowRecord, id: 'borrow_2', borrowerId: 'borrower_456' },
      ]
      mockGetBorrowsByBorrower.mockResolvedValue(borrows)

      const result = await getMyBorrows()

      expect(result).toHaveLength(2)
    })
  })

  describe('getPendingReturnConfirmations', () => {
    it('returns empty array when user not logged in', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const result = await getPendingReturnConfirmations()

      expect(result).toEqual([])
    })

    it('returns pending return confirmations for the owner', async () => {
      mockAuth.mockResolvedValue({ userId: 'owner_123' })
      const pendingReturns = [
        { ...mockBorrowRecord, returnedAt: new Date() },
        { ...mockBorrowRecord, id: 'borrow_2', returnedAt: new Date() },
      ]
      mockGetPendingReturns.mockResolvedValue(pendingReturns)

      const result = await getPendingReturnConfirmations()

      expect(result).toHaveLength(2)
    })
  })
})
