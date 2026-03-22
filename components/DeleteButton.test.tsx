import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteButton from '@/components/DeleteButton'

describe('DeleteButton', () => {
  const mockDeleteAction = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders delete button with default label', () => {
    render(<DeleteButton deleteAction={mockDeleteAction} id={1} />)
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('renders delete button with custom label', () => {
    render(<DeleteButton deleteAction={mockDeleteAction} id={1} label="Remove" />)
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  it('shows confirmation dialog on first click', async () => {
    const user = userEvent.setup()
    render(<DeleteButton deleteAction={mockDeleteAction} id={1} />)

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('cancels confirmation on cancel click', async () => {
    const user = userEvent.setup()
    render(<DeleteButton deleteAction={mockDeleteAction} id={1} />)

    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('calls delete action when confirmed', async () => {
    const user = userEvent.setup()
    render(<DeleteButton deleteAction={mockDeleteAction} id={1} />)

    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getByRole('button', { name: /yes, delete/i }))

    expect(mockDeleteAction).toHaveBeenCalledWith(1)
  })

  it('shows loading state while deleting', async () => {
    const user = userEvent.setup()
    const slowDeleteAction = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<DeleteButton deleteAction={slowDeleteAction} id={1} />)

    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getByRole('button', { name: /yes, delete/i }))

    expect(screen.getByText(/deleting/i)).toBeInTheDocument()
  })

  it('applies danger variant styling by default', () => {
    render(<DeleteButton deleteAction={mockDeleteAction} id={1} />)
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-red-600')
    expect(button).toHaveClass('text-white')
    expect(button).toHaveClass('hover:bg-red-700')
  })

  it('applies primary variant styling when specified', () => {
    render(<DeleteButton deleteAction={mockDeleteAction} id={1} variant="primary" />)
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-slate-800')
    expect(button).toHaveClass('text-stone-100')
  })
})
