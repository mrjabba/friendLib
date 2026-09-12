import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { render } from '@/test/utils/render'

const {
  mockGetMyBorrows,
  mockMarkBookReturned,
  mockGetIncomingBorrowRequests,
  mockApproveBorrowRequest,
  mockRejectBorrowRequest,
  mockGetPendingReturnConfirmations,
  mockConfirmBookReturn,
  mockRequestBorrow,
  mockSearchBooks,
  mockAddBook,
  mockDeleteBook,
} = vi.hoisted(() => ({
  mockGetMyBorrows: vi.fn(),
  mockMarkBookReturned: vi.fn(),
  mockGetIncomingBorrowRequests: vi.fn(),
  mockApproveBorrowRequest: vi.fn(),
  mockRejectBorrowRequest: vi.fn(),
  mockGetPendingReturnConfirmations: vi.fn(),
  mockConfirmBookReturn: vi.fn(),
  mockRequestBorrow: vi.fn(),
  mockSearchBooks: vi.fn(),
  mockAddBook: vi.fn(),
  mockDeleteBook: vi.fn(),
}))

vi.mock('./borrow/actions', () => ({
  getMyBorrows: mockGetMyBorrows,
  markBookReturned: mockMarkBookReturned,
  getIncomingBorrowRequests: mockGetIncomingBorrowRequests,
  approveBorrowRequest: mockApproveBorrowRequest,
  rejectBorrowRequest: mockRejectBorrowRequest,
  getPendingReturnConfirmations: mockGetPendingReturnConfirmations,
  confirmBookReturn: mockConfirmBookReturn,
  requestBorrow: mockRequestBorrow,
}))
vi.mock('./delete-actions', () => ({ deleteBook: mockDeleteBook }))
// The book detail page reads `?id=` from the query string, so override the
// shared navigation mock with a search string these tests can rely on.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams('id=1'),
  usePathname: () => '/',
  useParams: () => ({}),
  redirect: vi.fn(),
}))
vi.mock('./book-search/actions', () => ({ searchBooks: mockSearchBooks }))
vi.mock('./book-add/actions', () => ({ addBook: mockAddBook }))

import MyBorrowsPage from './my-borrows/page'
import BorrowRequestsPage from './borrow-requests/page'
import ReturnConfirmationPage from './return-confirmation/page'
import BookSearchPage from './book-search/page'
import BookAddPage from './book-add/page'
import BookListPage, { BookListComponent } from './book-list/page'
import BookDetailPage from './book-detail/page'

/** Responds to the per-book title lookups these pages make. */
function fetchReturnsBook(title = 'Dune') {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ book: { id: 1, title } }),
  })
}

const book = {
  id: 1,
  title: 'Dune',
  author: 'Frank Herbert',
  pages: 412,
  isbn13: '9780441013593',
  userId: 'user_123',
  ownerEmail: 'owner@example.com',
}

beforeEach(() => {
  vi.clearAllMocks()
  fetchReturnsBook()
})

describe('MyBorrowsPage', () => {
  it('tells the user when they have borrowed nothing', async () => {
    mockGetMyBorrows.mockResolvedValue([])

    render(<MyBorrowsPage />)

    expect(await screen.findByText(/haven't borrowed any books yet/i)).toBeInTheDocument()
  })

  it('shows the borrowed book with its title and status', async () => {
    mockGetMyBorrows.mockResolvedValue([
      {
        id: 'b1',
        bookId: 1,
        ownerId: 'u2',
        requestedAt: new Date('2024-01-02'),
        approvedAt: new Date('2024-01-03'),
        rejectedAt: null,
        returnedAt: null,
        ownerConfirmedReturnAt: null,
      },
    ])

    render(<MyBorrowsPage />)

    expect(await screen.findByText('Dune')).toBeInTheDocument()
    expect(screen.getByText('Approved - Borrowed')).toBeInTheDocument()
  })

  it.each([
    [{ ownerConfirmedReturnAt: new Date() }, 'Returned & Confirmed'],
    [{ returnedAt: new Date() }, 'Returned - Pending Confirmation'],
    [{ rejectedAt: new Date() }, 'Request Rejected'],
    [{}, 'Pending Approval'],
  ])('labels the borrow state as %s', async (overrides, label) => {
    mockGetMyBorrows.mockResolvedValue([
      {
        id: 'b1',
        bookId: 1,
        ownerId: 'u2',
        requestedAt: new Date('2024-01-02'),
        approvedAt: null,
        rejectedAt: null,
        returnedAt: null,
        ownerConfirmedReturnAt: null,
        ...overrides,
      },
    ])

    render(<MyBorrowsPage />)

    expect(await screen.findByText(label)).toBeInTheDocument()
  })

  it('falls back to a book number when the title lookup fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'))
    mockGetMyBorrows.mockResolvedValue([
      {
        id: 'b1',
        bookId: 77,
        ownerId: 'u2',
        requestedAt: null,
        approvedAt: null,
        rejectedAt: null,
        returnedAt: null,
        ownerConfirmedReturnAt: null,
      },
    ])

    render(<MyBorrowsPage />)

    expect(await screen.findByText('Unknown Book')).toBeInTheDocument()
  })

  it('renders German copy when the German locale is active', async () => {
    mockGetMyBorrows.mockResolvedValue([])

    render(<MyBorrowsPage />, { locale: 'de' })

    expect(await screen.findByText('Meine Ausleihen')).toBeInTheDocument()
    expect(screen.getByText('Zurück zur Startseite')).toBeInTheDocument()
  })
})

describe('BorrowRequestsPage', () => {
  it('reports when there are no incoming requests', async () => {
    mockGetIncomingBorrowRequests.mockResolvedValue([])

    render(<BorrowRequestsPage />)

    expect(await screen.findByText(/no pending borrow requests/i)).toBeInTheDocument()
  })

  it('approves a request', async () => {
    mockGetIncomingBorrowRequests.mockResolvedValue([
      { id: 'r1', bookId: 1, borrowerId: 'u2', requestedAt: new Date('2024-01-02') },
    ])

    render(<BorrowRequestsPage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Approve' }))

    expect(mockApproveBorrowRequest).toHaveBeenCalledWith('r1')
  })

  it('rejects a request', async () => {
    mockGetIncomingBorrowRequests.mockResolvedValue([
      { id: 'r1', bookId: 1, borrowerId: 'u2', requestedAt: new Date('2024-01-02') },
    ])

    render(<BorrowRequestsPage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Reject' }))

    expect(mockRejectBorrowRequest).toHaveBeenCalledWith('r1')
  })

  it('renders Spanish copy when the Spanish locale is active', async () => {
    mockGetIncomingBorrowRequests.mockResolvedValue([])

    render(<BorrowRequestsPage />, { locale: 'es' })

    expect(await screen.findByText('Solicitudes de préstamo')).toBeInTheDocument()
  })
})

describe('ReturnConfirmationPage', () => {
  it('reports when nothing awaits confirmation', async () => {
    mockGetPendingReturnConfirmations.mockResolvedValue([])

    render(<ReturnConfirmationPage />)

    expect(await screen.findByText(/no returns pending confirmation/i)).toBeInTheDocument()
  })

  it('confirms a pending return', async () => {
    mockGetPendingReturnConfirmations.mockResolvedValue([
      { id: 'r1', bookId: 1, borrowerId: 'u2', returnedAt: new Date('2024-02-02') },
    ])

    render(<ReturnConfirmationPage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Confirm Return' }))

    expect(mockConfirmBookReturn).toHaveBeenCalledWith('r1')
  })

  it('renders French copy when the French locale is active', async () => {
    mockGetPendingReturnConfirmations.mockResolvedValue([])

    render(<ReturnConfirmationPage />, { locale: 'fr' })

    expect(await screen.findByText('Confirmer les retours')).toBeInTheDocument()
  })
})

describe('BookSearchPage', () => {
  it('shows results for a search', async () => {
    mockSearchBooks.mockResolvedValue([book])

    render(<BookSearchPage />)
    await userEvent.type(screen.getByLabelText('Search'), 'dune')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByRole('link', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.getByText('Results (1)')).toBeInTheDocument()
    expect(mockSearchBooks).toHaveBeenCalledWith('dune')
  })

  it('offers edit and delete only on books the user owns', async () => {
    mockSearchBooks.mockResolvedValue([
      book,
      { ...book, id: 2, title: 'Emma', userId: 'someone_else' },
    ])

    render(<BookSearchPage />)
    await userEvent.type(screen.getByLabelText('Search'), 'a')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    await screen.findByRole('link', { name: 'Dune' })
    expect(screen.getAllByRole('link', { name: 'Edit' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1)
  })

  it('reports an empty result set', async () => {
    mockSearchBooks.mockResolvedValue([])

    render(<BookSearchPage />)
    await userEvent.type(screen.getByLabelText('Search'), 'zzz')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByText('No books found.')).toBeInTheDocument()
  })

  it('renders German copy when the German locale is active', () => {
    render(<BookSearchPage />, { locale: 'de' })

    expect(screen.getByRole('heading', { name: 'Buchsuche' })).toBeInTheDocument()
    expect(screen.getByLabelText('Suchen')).toBeInTheDocument()
  })
})

describe('BookAddPage', () => {
  it('renders a labelled form for every book field', () => {
    render(<BookAddPage />)

    for (const label of ['Title', 'Author', 'Pages', 'ISBN-13']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('renders Spanish labels when the Spanish locale is active', () => {
    render(<BookAddPage />, { locale: 'es' })

    expect(screen.getByRole('heading', { name: 'Añadir libro' })).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })
})

describe('BookListPage', () => {
  it('points the user at the search page', () => {
    render(<BookListPage />)

    expect(screen.getByRole('heading', { name: 'Books' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to Book Search' })).toBeInTheDocument()
  })

  it('shows a detail card for the hovered book', async () => {
    render(<BookListComponent books={[book]} />)

    const listItem = screen.getByRole('listitem')
    await userEvent.hover(listItem)

    expect(screen.getByText('Frank Herbert')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View Details' })).toBeInTheDocument()

    await userEvent.unhover(listItem)
    expect(screen.queryByText('Frank Herbert')).not.toBeInTheDocument()
  })
})

describe('BookDetailPage', () => {
  /** Serves the detail payload the page fetches for `?id=1`. */
  function detailReturns(payload: Record<string, unknown>) {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => payload })
  }

  it('reports a book that does not exist', async () => {
    detailReturns({ book: null })

    render(<BookDetailPage />)

    expect(await screen.findByText('Book Not Found')).toBeInTheDocument()
  })

  it('shows details, genres and a borrow button for another owner’s available book', async () => {
    detailReturns({
      book: { ...book, userId: 'someone_else', isbn13: '9780441013593' },
      genres: [{ id: 1, value: 'Sci-Fi' }],
      borrowStatus: 'available',
    })

    render(<BookDetailPage />)

    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Borrow' })).toBeInTheDocument()
  })

  it('offers edit and delete on the user’s own book instead of borrowing', async () => {
    detailReturns({ book, genres: [], borrowStatus: 'available' })

    render(<BookDetailPage />)

    await screen.findByRole('heading', { name: 'Dune' })
    expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Borrow' })).not.toBeInTheDocument()
  })

  it('tells the borrower they hold the book and offers a return', async () => {
    detailReturns({
      book: { ...book, userId: 'someone_else' },
      genres: [],
      borrowStatus: 'borrowed',
      activeBorrow: { id: 'b1', borrowerId: 'user_123', returnedAt: null },
    })

    render(<BookDetailPage />)

    expect(await screen.findByText('You are currently borrowing this book')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mark as Returned' })).toBeInTheDocument()
  })

  it('says a book is borrowed by somebody else', async () => {
    detailReturns({
      book: { ...book, userId: 'someone_else' },
      genres: [],
      borrowStatus: 'borrowed',
      activeBorrow: { id: 'b1', borrowerId: 'other_user', returnedAt: null },
    })

    render(<BookDetailPage />)

    expect(await screen.findByText('This book is currently borrowed')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Borrow' })).not.toBeInTheDocument()
  })

  it('flags a pending borrow request', async () => {
    detailReturns({
      book: { ...book, userId: 'someone_else' },
      genres: [],
      borrowStatus: 'pending',
    })

    render(<BookDetailPage />)

    expect(
      await screen.findByText('There is a pending borrow request for this book'),
    ).toBeInTheDocument()
  })

  it('renders French copy when the French locale is active', async () => {
    detailReturns({ book, genres: [], borrowStatus: 'available' })

    render(<BookDetailPage />, { locale: 'fr' })

    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Ajouter un autre livre' })).toBeInTheDocument(),
    )
    expect(screen.getByRole('link', { name: 'Modifier' })).toBeInTheDocument()
  })
})
