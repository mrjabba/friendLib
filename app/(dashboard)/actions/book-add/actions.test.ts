import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock dependencies before imports
const { mockDbSelect } = vi.hoisted(() => ({
  mockDbSelect: vi.fn(),
}))

vi.mock('@/db', () => ({
  db: {
    select: mockDbSelect,
  },
}))

vi.mock('@/db/schema', () => ({
  books: { id: 'books' },
  genre: { id: 'genre', value: 'genre' },
  bookGenre: { bookId: 'bookGenre', genreId: 'bookGenre' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue('eq-condition'),
}))

import { getBookGenres } from './actions'

describe('book-add actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getBookGenres', () => {
    it('returns genres for a book', async () => {
      const mockReturnValue = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              { id: 1, value: 'Fiction' },
              { id: 2, value: 'Adventure' },
            ]),
          }),
        }),
      }
      mockDbSelect.mockReturnValue(mockReturnValue)

      const result = await getBookGenres(1)

      expect(result).toEqual([
        { id: 1, value: 'Fiction' },
        { id: 2, value: 'Adventure' },
      ])
      expect(mockDbSelect).toHaveBeenCalled()
    })

    it('returns empty array when no genres exist', async () => {
      const mockReturnValue = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      }
      mockDbSelect.mockReturnValue(mockReturnValue)

      const result = await getBookGenres(999)

      expect(result).toEqual([])
    })
  })
})
