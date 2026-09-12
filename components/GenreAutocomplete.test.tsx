import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import { render } from '@/test/utils/render'
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
  it('does not search until the query reaches two characters', async () => {
    render(<GenreAutocomplete selectedGenres={[]} onChange={vi.fn()} />)

    await userEvent.type(screen.getByRole('textbox'), 'S')

    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('shows matching genres from the search endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: async () => mockGenres })
    render(<GenreAutocomplete selectedGenres={[]} onChange={vi.fn()} />)

    await userEvent.type(screen.getByRole('textbox'), 'dra')

    expect(await screen.findByRole('button', { name: 'Drama' })).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith('/api/genres/search?q=dra')
  })

  it('hides genres that are already selected', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: async () => mockGenres })
    render(<GenreAutocomplete selectedGenres={[mockGenres[2]]} onChange={vi.fn()} />)

    await userEvent.type(screen.getByRole('textbox'), 'dra')

    expect(await screen.findByRole('button', { name: 'Fantasy' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Drama' })).not.toBeInTheDocument()
  })

  it('adds a genre to the selection when one is picked', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: async () => mockGenres })
    const onChange = vi.fn()
    render(<GenreAutocomplete selectedGenres={[]} onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), 'dra')
    await userEvent.click(await screen.findByRole('button', { name: 'Drama' }))

    expect(onChange).toHaveBeenCalledWith([mockGenres[2]])
  })

  it('offers to create a genre that does not exist yet', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: async () => [] })
    render(<GenreAutocomplete selectedGenres={[]} onChange={vi.fn()} />)

    await userEvent.type(screen.getByRole('textbox'), 'Westerns')

    expect(await screen.findByRole('button', { name: /Create "Westerns"/ })).toBeInTheDocument()
    expect(screen.queryByText(/no matching genres/i)).not.toBeInTheDocument()
  })

  it('does not offer to create a genre that already exists exactly', async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: async () => [{ id: 2, value: 'Fantasy' }] })
    render(<GenreAutocomplete selectedGenres={[]} onChange={vi.fn()} />)

    await userEvent.type(screen.getByRole('textbox'), 'fantasy')

    await screen.findByRole('button', { name: 'Fantasy' })
    expect(screen.queryByRole('button', { name: /Create/ })).not.toBeInTheDocument()
  })

  it('creates a genre and selects it, trimming the typed value', async () => {
    const created = { id: 42, value: 'Westerns' }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ json: async () => [] })
      .mockResolvedValueOnce({ json: async () => created })
    global.fetch = fetchMock
    const onChange = vi.fn()
    render(<GenreAutocomplete selectedGenres={[]} onChange={onChange} />)

    await userEvent.type(screen.getByRole('textbox'), 'Westerns ')
    await userEvent.click(await screen.findByRole('button', { name: /Create/ }))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith([created]))
    expect(fetchMock).toHaveBeenLastCalledWith('/api/genres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'Westerns' }),
    })
  })

  it('reports a search failure without crashing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    render(<GenreAutocomplete selectedGenres={[]} onChange={vi.fn()} />)

    await userEvent.type(screen.getByRole('textbox'), 'dra')

    await waitFor(() => expect(consoleError).toHaveBeenCalled())
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    consoleError.mockRestore()
  })

  it('submits one hidden input per selected genre so forms post the ids', () => {
    const { container } = render(
      <GenreAutocomplete selectedGenres={mockGenres} onChange={vi.fn()} />,
    )

    const hidden = container.querySelectorAll('input[type="hidden"][name="genreIds"]')
    expect(Array.from(hidden).map((el) => (el as HTMLInputElement).value)).toEqual(['1', '2', '3'])
  })
})
