import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSelect } = vi.hoisted(() => ({ mockSelect: vi.fn() }))

vi.mock('@/db', () => ({ db: { select: mockSelect } }))

import { GET } from './route'

const request = {} as any
const routeParams = (id: string) => ({ params: Promise.resolve({ id }) })

/** A `select().from().where().limit()` chain resolving to `rows`. */
const limitChain = (rows: unknown[]) => ({
  from: () => ({ where: () => ({ limit: vi.fn().mockResolvedValue(rows) }) }),
})

/** A `select().from().innerJoin().where()` chain resolving to `rows`. */
const joinChain = (rows: unknown[]) => ({
  from: () => ({ innerJoin: () => ({ where: vi.fn().mockResolvedValue(rows) }) }),
})

const book = {
  id: 5,
  title: 'Dune',
  author: 'Herbert',
  pages: 412,
  isbn13: 9780441013593,
  userId: 'user_123',
}

/**
 * The handler queries, in order: the book, its genres, an active borrow, then a
 * pending request.
 */
function queriesResolveTo({
  books = [book],
  genres = [] as unknown[],
  activeBorrow = [] as unknown[],
  pendingRequest = [] as unknown[],
} = {}) {
  mockSelect
    .mockReturnValueOnce(limitChain(books))
    .mockReturnValueOnce(joinChain(genres))
    .mockReturnValueOnce(limitChain(activeBorrow))
    .mockReturnValueOnce(limitChain(pendingRequest))
}

describe('GET /api/books/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each(['abc', ''])('rejects a non-numeric id (%j) with 400', async (id) => {
    const response = await GET(request, routeParams(id))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Invalid book ID' })
  })

  it('returns empty payload when no book has that id', async () => {
    mockSelect.mockReturnValueOnce(limitChain([]))

    const response = await GET(request, routeParams('404'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ book: null, genres: [], borrowStatus: null })
    // Genres and borrow state are not queried for a missing book.
    expect(mockSelect).toHaveBeenCalledTimes(1)
  })

  it('reports an available book with its genres', async () => {
    const genres = [{ id: 1, value: 'Sci-Fi' }]
    queriesResolveTo({ genres })

    const response = await GET(request, routeParams('5'))

    await expect(response.json()).resolves.toEqual({
      book,
      genres,
      borrowStatus: 'available',
      activeBorrow: null,
    })
  })

  it('reports a borrowed book and includes the active borrow', async () => {
    const activeBorrow = { id: 'borrow_1', borrowerId: 'user_999', returnedAt: null }
    queriesResolveTo({ activeBorrow: [activeBorrow] })

    const response = await GET(request, routeParams('5'))
    const payload = await response.json()

    expect(payload.borrowStatus).toBe('borrowed')
    expect(payload.activeBorrow).toEqual(activeBorrow)
  })

  it('reports a pending request without exposing borrow details', async () => {
    queriesResolveTo({ pendingRequest: [{ id: 'borrow_2' }] })

    const response = await GET(request, routeParams('5'))
    const payload = await response.json()

    expect(payload.borrowStatus).toBe('pending')
    expect(payload.activeBorrow).toBeNull()
  })

  it('prefers the active borrow when a pending request also exists', async () => {
    queriesResolveTo({
      activeBorrow: [{ id: 'borrow_1' }],
      pendingRequest: [{ id: 'borrow_2' }],
    })

    const response = await GET(request, routeParams('5'))

    await expect(response.json()).resolves.toMatchObject({ borrowStatus: 'borrowed' })
  })

  it('returns 500 when a query fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSelect.mockImplementation(() => {
      throw new Error('db down')
    })

    const response = await GET(request, routeParams('5'))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch book' })
  })
})
