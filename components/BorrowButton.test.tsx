import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BorrowButton from '@/components/BorrowButton'

describe('BorrowButton', () => {
  const mockOnBorrow = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders borrow button', () => {
    render(<BorrowButton onBorrow={mockOnBorrow} bookId={1} />)
    expect(screen.getByRole('button', { name: /borrow/i })).toBeInTheDocument()
  })

  it('shows confirmation dialog on first click', async () => {
    const user = userEvent.setup()
    render(<BorrowButton onBorrow={mockOnBorrow} bookId={1} />)

    await user.click(screen.getByRole('button', { name: /borrow/i }))

    expect(screen.getByText(/request to borrow/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, borrow/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('cancels confirmation on cancel click', async () => {
    const user = userEvent.setup()
    render(<BorrowButton onBorrow={mockOnBorrow} bookId={1} />)

    await user.click(screen.getByRole('button', { name: /borrow/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByText(/request to borrow/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /borrow/i })).toBeInTheDocument()
  })

  it('calls onBorrow when confirmed', async () => {
    const user = userEvent.setup()
    mockOnBorrow.mockResolvedValue({ success: true })
    render(<BorrowButton onBorrow={mockOnBorrow} bookId={1} />)

    await user.click(screen.getByRole('button', { name: /borrow/i }))
    await user.click(screen.getByRole('button', { name: /yes, borrow/i }))

    expect(mockOnBorrow).toHaveBeenCalledWith(1)
  })

  it('shows error message when borrow fails', async () => {
    const user = userEvent.setup()
    mockOnBorrow.mockResolvedValue({ success: false, error: 'Book is not available' })
    render(<BorrowButton onBorrow={mockOnBorrow} bookId={1} />)

    await user.click(screen.getByRole('button', { name: /borrow/i }))
    await user.click(screen.getByRole('button', { name: /yes, borrow/i }))

    expect(screen.getByText(/book is not available/i)).toBeInTheDocument()
  })

  it('disables button when disabled prop is true', () => {
    render(<BorrowButton onBorrow={mockOnBorrow} bookId={1} disabled />)
    expect(screen.getByRole('button', { name: /borrow/i })).toBeDisabled()
  })

  it('shows loading state while borrowing', async () => {
    const user = userEvent.setup()
    mockOnBorrow.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)),
    )
    render(<BorrowButton onBorrow={mockOnBorrow} bookId={1} />)

    await user.click(screen.getByRole('button', { name: /borrow/i }))
    await user.click(screen.getByRole('button', { name: /yes, borrow/i }))

    expect(screen.getByText(/sending/i)).toBeInTheDocument()
  })
})
