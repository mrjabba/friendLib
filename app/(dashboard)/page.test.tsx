import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/utils/render'

// Mock fetch - needs to be set globally before component loads
vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([]),
  }),
)

import DashboardPage from './page'

describe('dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // restoreAllMocks below clears the stub, so re-arm fetch for each test.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(<DashboardPage />)
    expect(container).toBeInTheDocument()
  })

  it('shows the tagline and the signed-in email address', async () => {
    render(<DashboardPage />)

    expect(
      await screen.findByText('Search, borrow and loan books with friends.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Logged in as: test@example.com')).toBeInTheDocument()
  })

  it('lists genres with a pluralised book count', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { id: 1, value: 'Sci-Fi', count: 3 },
          { id: 2, value: 'Poetry', count: 1 },
        ],
      }),
    )

    render(<DashboardPage />)

    expect(await screen.findByRole('link', { name: /Sci-Fi/ })).toBeInTheDocument()
    expect(screen.getByText('3 books')).toBeInTheDocument()
    expect(screen.getByText('1 book')).toBeInTheDocument()
  })

  it('reports when there are no genres yet', async () => {
    render(<DashboardPage />)

    expect(await screen.findByText('No genres found.')).toBeInTheDocument()
  })

  it('translates the dashboard for the active locale', async () => {
    render(<DashboardPage />, { locale: 'es' })

    expect(await screen.findByText('Popularidad de géneros')).toBeInTheDocument()
  })
})
