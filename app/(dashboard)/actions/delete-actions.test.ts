import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAuth, mockRedirect, mockSelect, mockDelete } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockRedirect: vi.fn(),
  mockSelect: vi.fn(),
  mockDelete: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({ auth: mockAuth }))
vi.mock('next/navigation', () => ({ redirect: mockRedirect }))
vi.mock('@/db', () => ({
  db: { select: mockSelect, delete: mockDelete },
}))

import { deleteBook } from './delete-actions'

/** Makes the ownership lookup resolve to `rows`. */
function ownershipLookupReturns(rows: Array<{ userId: string }>) {
  mockSelect.mockReturnValue({
    from: () => ({
      where: () => ({ limit: vi.fn().mockResolvedValue(rows) }),
    }),
  })
}

describe('deleteBook', () => {
  const deleteWhere = vi.fn().mockResolvedValue({})

  beforeEach(() => {
    vi.clearAllMocks()
    mockDelete.mockReturnValue({ where: deleteWhere })
  })

  it('rejects a signed-out caller', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    await expect(deleteBook(1)).rejects.toThrow(/Unauthorized/)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('rejects deleting a book owned by somebody else', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    ownershipLookupReturns([{ userId: 'user_999' }])

    await expect(deleteBook(1)).rejects.toThrow(/Forbidden/)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('rejects deleting a book that does not exist', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    ownershipLookupReturns([])

    await expect(deleteBook(42)).rejects.toThrow(/Forbidden/)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('deletes the book and its genre links for the owner, then redirects home', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    ownershipLookupReturns([{ userId: 'user_123' }])

    await deleteBook(7)

    // Genre links first, then the book itself, so no orphaned rows remain.
    expect(mockDelete).toHaveBeenCalledTimes(2)
    expect(deleteWhere).toHaveBeenCalledTimes(2)
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })
})
