import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSelect } = vi.hoisted(() => ({ mockSelect: vi.fn() }))

vi.mock('@/db', () => ({ db: { select: mockSelect } }))

import { GET } from './route'

function searchRequest(query: string) {
  return { url: `http://localhost/api/genres/search${query}` } as any
}

/** Makes the search query resolve to `rows`. */
function searchReturns(rows: Array<{ id: number; value: string }>) {
  const limit = vi.fn().mockResolvedValue(rows)
  mockSelect.mockReturnValue({
    from: () => ({
      where: () => ({ orderBy: () => ({ limit }) }),
    }),
  })
  return limit
}

describe('GET /api/genres/search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    ['no query parameter', ''],
    ['an empty query', '?q='],
    ['a single character', '?q=a'],
  ])('returns an empty list for %s without touching the database', async (_label, query) => {
    const response = await GET(searchRequest(query))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual([])
    expect(mockSelect).not.toHaveBeenCalled()
  })

  it('returns matches for a query of two characters or more', async () => {
    const rows = [{ id: 1, value: 'Fantasy' }]
    const limit = searchReturns(rows)

    const response = await GET(searchRequest('?q=fa'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(rows)
    expect(limit).toHaveBeenCalledWith(10)
  })

  it('returns 500 when the search fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSelect.mockImplementation(() => {
      throw new Error('db down')
    })

    const response = await GET(searchRequest('?q=fantasy'))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'Failed to search genres' })
  })
})
