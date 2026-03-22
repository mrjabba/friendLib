import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GenreAutocomplete from '@/components/GenreAutocomplete'

const mockGenres = [
  { id: 1, value: 'Science Fiction' },
  { id: 2, value: 'Fantasy' },
  { id: 3, value: 'Drama' },
]

describe('GenreAutocomplete', () => {
  beforeEach(() => {
    vi.useRealTimers()
    global.fetch = vi.fn()
  })

  it('renders input field with placeholder', () => {
    render(<GenreAutocomplete selectedGenres={[]} onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText(/type to search or create genres/i)).toBeInTheDocument()
  })

  it('renders selected genres as pills', () => {
    render(
      <GenreAutocomplete
        selectedGenres={[
          { id: 1, value: 'Sci-Fi' },
          { id: 2, value: 'Adventure' },
        ]}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
    expect(screen.getByText('Adventure')).toBeInTheDocument()
  })

  it('does not render dropdown initially', () => {
    render(<GenreAutocomplete selectedGenres={[]} onChange={vi.fn()} />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
