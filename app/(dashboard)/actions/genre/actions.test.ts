import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSelect } = vi.hoisted(() => ({ mockSelect: vi.fn() }))

vi.mock('@/db', () => ({ db: { select: mockSelect } }))

import {
  getBooksByGenre,
  getBooksByGenreForUser,
  getGenreById,
  getGenrePopularity,
} from './actions'

const book = {
  id: 1,
  title: 'Dune',
  author: 'Herbert',
  pages: 412,
  isbn13: 9780441013593,
  userId: 'user_123',
}

describe('getGenrePopularity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns each genre with its aggregated book count', async () => {
    const rows = [{ id: 1, value: 'Sci-Fi', count: 3 }]
    mockSelect.mockReturnValue({
      from: () => ({
        leftJoin: () => ({ groupBy: () => ({ orderBy: vi.fn().mockResolvedValue(rows) }) }),
      }),
    })

    await expect(getGenrePopularity()).resolves.toEqual(rows)
  })
})

describe('getGenreById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function lookupReturns(rows: unknown[]) {
    mockSelect.mockReturnValue({
      from: () => ({ where: () => ({ limit: vi.fn().mockResolvedValue(rows) }) }),
    })
  }

  it('returns the matching genre', async () => {
    lookupReturns([{ id: 2, value: 'Fantasy' }])
    await expect(getGenreById(2)).resolves.toEqual({ id: 2, value: 'Fantasy' })
  })

  it('returns null when no genre has that id', async () => {
    lookupReturns([])
    await expect(getGenreById(999)).resolves.toBeNull()
  })
})

describe('getBooksByGenre', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the books joined to that genre', async () => {
    mockSelect.mockReturnValue({
      from: () => ({
        innerJoin: () => ({ where: vi.fn().mockResolvedValue([book]) }),
      }),
    })

    await expect(getBooksByGenre(1)).resolves.toEqual([book])
  })

  it('returns an empty list for a genre with no books', async () => {
    mockSelect.mockReturnValue({
      from: () => ({
        innerJoin: () => ({ where: vi.fn().mockResolvedValue([]) }),
      }),
    })

    await expect(getBooksByGenre(1)).resolves.toEqual([])
  })
})

describe('getBooksByGenreForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('caps the result set at 50 books', async () => {
    const limit = vi.fn().mockResolvedValue([book])
    mockSelect.mockReturnValue({
      from: () => ({
        innerJoin: () => ({ where: () => ({ limit }) }),
      }),
    })

    await expect(getBooksByGenreForUser(1, 'user_123')).resolves.toEqual([book])
    expect(limit).toHaveBeenCalledWith(50)
  })
})
