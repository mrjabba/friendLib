import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { searchBooks, getAllBooksWithOwners } from './actions'

describe('book-search actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('searchBooks', () => {
    it('returns empty array for empty query', async () => {
      const result = await searchBooks('')
      expect(result).toEqual([])
    })

    it('returns empty array for whitespace-only query', async () => {
      const result = await searchBooks('   ')
      expect(result).toEqual([])
    })

    it('returns empty array for null query', async () => {
      const result = await searchBooks(null as never)
      expect(result).toEqual([])
    })
  })
})
