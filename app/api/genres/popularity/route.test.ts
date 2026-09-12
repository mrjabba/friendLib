import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSelect } = vi.hoisted(() => ({ mockSelect: vi.fn() }))

vi.mock('@/db', () => ({ db: { select: mockSelect } }))

import { GET } from './route'

describe('GET /api/genres/popularity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns each genre with its book count', async () => {
    const rows = [
      { id: 1, value: 'Sci-Fi', count: 4 },
      { id: 2, value: 'Poetry', count: 0 },
    ]
    mockSelect.mockReturnValue({
      from: () => ({
        leftJoin: () => ({
          groupBy: () => ({ orderBy: vi.fn().mockResolvedValue(rows) }),
        }),
      }),
    })

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(rows)
  })

  it('returns 500 when the aggregate query fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSelect.mockImplementation(() => {
      throw new Error('db down')
    })

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch genres' })
  })
})
