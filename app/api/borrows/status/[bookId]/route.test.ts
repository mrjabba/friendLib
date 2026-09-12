import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSelect } = vi.hoisted(() => ({ mockSelect: vi.fn() }))

vi.mock('@/db', () => ({ db: { select: mockSelect } }))

import { GET } from './route'

const request = {} as any
const routeParams = (bookId: string) => ({ params: Promise.resolve({ bookId }) })

const limitChain = (rows: unknown[]) => ({
  from: () => ({ where: () => ({ limit: vi.fn().mockResolvedValue(rows) }) }),
})

/** The handler queries the active borrow first, then any pending request. */
function queriesResolveTo(activeBorrow: unknown[], pendingRequest: unknown[]) {
  mockSelect
    .mockReturnValueOnce(limitChain(activeBorrow))
    .mockReturnValueOnce(limitChain(pendingRequest))
}

describe('GET /api/borrows/status/[bookId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects a non-numeric book id with 400', async () => {
    const response = await GET(request, routeParams('not-a-number'))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Invalid book ID' })
  })

  it('reports an available book with no borrow attached', async () => {
    queriesResolveTo([], [])

    const response = await GET(request, routeParams('5'))

    await expect(response.json()).resolves.toEqual({ status: 'available', borrow: null })
  })

  it('reports a borrowed book with the active borrow', async () => {
    const borrow = { id: 'borrow_1', bookId: 5 }
    queriesResolveTo([borrow], [])

    const response = await GET(request, routeParams('5'))

    await expect(response.json()).resolves.toEqual({ status: 'borrowed', borrow })
  })

  it('reports a pending request with the requesting borrow', async () => {
    const borrow = { id: 'borrow_2', bookId: 5 }
    queriesResolveTo([], [borrow])

    const response = await GET(request, routeParams('5'))

    await expect(response.json()).resolves.toEqual({ status: 'pending', borrow })
  })

  it('returns 500 when a query fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSelect.mockImplementation(() => {
      throw new Error('db down')
    })

    const response = await GET(request, routeParams('5'))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch borrow status' })
  })
})
