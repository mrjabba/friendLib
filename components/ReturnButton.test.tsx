import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReturnButton from '@/components/ReturnButton'

describe('ReturnButton', () => {
  const mockOnReturn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders return button', () => {
    render(<ReturnButton onReturn={mockOnReturn} borrowId="test-id" />)
    expect(screen.getByRole('button', { name: /mark as returned/i })).toBeInTheDocument()
  })

  it('shows confirmation dialog on first click', async () => {
    const user = userEvent.setup()
    render(<ReturnButton onReturn={mockOnReturn} borrowId="test-id" />)

    await user.click(screen.getByRole('button', { name: /mark as returned/i }))

    expect(screen.getByText(/mark book as returned/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, returned/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('cancels confirmation on cancel click', async () => {
    const user = userEvent.setup()
    render(<ReturnButton onReturn={mockOnReturn} borrowId="test-id" />)

    await user.click(screen.getByRole('button', { name: /mark as returned/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByText(/mark book as returned/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark as returned/i })).toBeInTheDocument()
  })

  it('calls onReturn when confirmed', async () => {
    const user = userEvent.setup()
    mockOnReturn.mockResolvedValue({ success: true })
    render(<ReturnButton onReturn={mockOnReturn} borrowId="test-id" />)

    await user.click(screen.getByRole('button', { name: /mark as returned/i }))
    await user.click(screen.getByRole('button', { name: /yes, returned/i }))

    expect(mockOnReturn).toHaveBeenCalledWith('test-id')
  })

  it('shows error message when return fails', async () => {
    const user = userEvent.setup()
    mockOnReturn.mockResolvedValue({ success: false, error: 'Cannot return unapproved book' })
    render(<ReturnButton onReturn={mockOnReturn} borrowId="test-id" />)

    await user.click(screen.getByRole('button', { name: /mark as returned/i }))
    await user.click(screen.getByRole('button', { name: /yes, returned/i }))

    expect(screen.getByText(/cannot return unapproved book/i)).toBeInTheDocument()
  })

  it('disables button when disabled prop is true', () => {
    render(<ReturnButton onReturn={mockOnReturn} borrowId="test-id" disabled />)
    expect(screen.getByRole('button', { name: /mark as returned/i })).toBeDisabled()
  })

  it('shows loading state while returning', async () => {
    const user = userEvent.setup()
    mockOnReturn.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)),
    )
    render(<ReturnButton onReturn={mockOnReturn} borrowId="test-id" />)

    await user.click(screen.getByRole('button', { name: /mark as returned/i }))
    await user.click(screen.getByRole('button', { name: /yes, returned/i }))

    expect(screen.getByText(/returning/i)).toBeInTheDocument()
  })
})
