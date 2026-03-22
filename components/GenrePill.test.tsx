import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GenrePill from '@/components/GenrePill'

describe('GenrePill', () => {
  it('renders genre value', () => {
    render(<GenrePill id={1} value="Science Fiction" />)
    expect(screen.getByText('Science Fiction')).toBeInTheDocument()
  })

  it('does not show remove button when removable is false', () => {
    render(<GenrePill id={1} value="Fantasy" removable={false} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('does not show remove button when removable is true but no onRemove provided', () => {
    render(<GenrePill id={1} value="Fantasy" removable={true} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows remove button when removable and onRemove are provided', () => {
    render(<GenrePill id={1} value="Drama" removable onRemove={vi.fn()} />)
    expect(screen.getByRole('button', { name: /remove drama/i })).toBeInTheDocument()
  })

  it('calls onRemove with correct id when remove button is clicked', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn()
    render(<GenrePill id={42} value="Comedy" removable onRemove={handleRemove} />)

    await user.click(screen.getByRole('button', { name: /remove comedy/i }))

    expect(handleRemove).toHaveBeenCalledWith(42)
  })

  it('renders with default styling', () => {
    render(<GenrePill id={1} value="Mystery" />)
    const pill = screen.getByText('Mystery').closest('span')
    expect(pill).toHaveClass('inline-flex')
    expect(pill).toHaveClass('items-center')
    expect(pill).toHaveClass('gap-1')
    expect(pill).toHaveClass('bg-slate-100')
  })
})
