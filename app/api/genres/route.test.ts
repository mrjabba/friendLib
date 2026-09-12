import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSelect, mockInsert } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockInsert: vi.fn(),
}))

vi.mock('@/db', () => ({ db: { select: mockSelect, insert: mockInsert } }))

import { GET, POST } from './route'

/** A minimal stand-in for the NextRequest body the handler reads. */
function postRequest(body: unknown) {
  return { json: async () => body } as any
}

describe('GET /api/genres', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns every genre ordered by value', async () => {
    const genres = [{ id: 1, value: 'Fantasy' }]
    mockSelect.mockReturnValue({
      from: () => ({ orderBy: vi.fn().mockResolvedValue(genres) }),
    })

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(genres)
  })

  it('returns 500 when the query fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSelect.mockImplementation(() => {
      throw new Error('db down')
    })

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch genres' })
  })
})

describe('POST /api/genres', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /** Makes the duplicate-check lookup resolve to `rows`. */
  function existingGenres(rows: Array<{ id: number; value: string }>) {
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => ({ limit: vi.fn().mockResolvedValue(rows) }),
      }),
    })
  }

  it.each([
    ['a missing value', {}],
    ['an empty value', { value: '' }],
    ['a whitespace-only value', { value: '   ' }],
  ])('rejects %s with 400', async (_label, body) => {
    const response = await POST(postRequest(body))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Genre value is required' })
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns the existing genre instead of creating a duplicate', async () => {
    existingGenres([{ id: 3, value: 'Sci-Fi' }])

    const response = await POST(postRequest({ value: 'Sci-Fi' }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ id: 3, value: 'Sci-Fi' })
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('creates a new genre with 201 and trims the value', async () => {
    existingGenres([])
    const returning = vi.fn().mockResolvedValue([{ id: 9, value: 'Poetry' }])
    const values = vi.fn(() => ({ returning }))
    mockInsert.mockReturnValue({ values })

    const response = await POST(postRequest({ value: '  Poetry  ' }))

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ id: 9, value: 'Poetry' })
    expect(values).toHaveBeenCalledWith({ value: 'Poetry' })
  })

  it('returns 500 when the insert fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    existingGenres([])
    mockInsert.mockImplementation(() => {
      throw new Error('db down')
    })

    const response = await POST(postRequest({ value: 'Poetry' }))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ error: 'Failed to create genre' })
  })
})
