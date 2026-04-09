import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  sendEmail,
  notifyBorrowRequest,
  notifyRequestApproved,
  notifyRequestRejected,
  notifyReturnPending,
  notifyReturnConfirmed,
} from '@/lib/email'

describe('email', () => {
  let env: NodeJS.ProcessEnv

  beforeEach(() => {
    // Store original env
    env = { ...process.env }
    // Ensure clean state for each test
    delete process.env.NODE_ENV
    delete process.env.RESEND_API_KEY
    delete process.env.EMAIL_FROM
  })

  afterEach(() => {
    // Restore original env
    process.env = env
    vi.restoreAllMocks()
  })

  describe('sendEmail', () => {
    it('logs email in development mode (default)', async () => {
      process.env.NODE_ENV = 'development'
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test body</p>',
      })

      expect(consoleSpy).toHaveBeenCalledWith('[Email] Sending email:')
      expect(consoleSpy).toHaveBeenCalledWith('  To: test@example.com')
      expect(consoleSpy).toHaveBeenCalledWith('  Subject: Test Subject')
    })

    it('skips sending when RESEND_API_KEY is missing in production', async () => {
      process.env.NODE_ENV = 'production'
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test body</p>',
      })

      expect(consoleSpy).toHaveBeenCalledWith('[Email] RESEND_API_KEY not set, skipping email')
    })

    it('sends email via Resend API in production with API key', async () => {
      process.env.NODE_ENV = 'production'
      process.env.RESEND_API_KEY = 'test_api_key'
      process.env.EMAIL_FROM = 'custom@friendlib.app'

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        statusText: 'OK',
      } as Response)

      await sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test body</p>',
      })

      expect(fetchSpy).toHaveBeenCalledWith('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test_api_key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'custom@friendlib.app',
          to: 'recipient@example.com',
          subject: 'Test Subject',
          html: '<p>Test body</p>',
        }),
      })
    })

    it('throws error when Resend API returns non-ok response', async () => {
      process.env.NODE_ENV = 'production'
      process.env.RESEND_API_KEY = 'test_api_key'

      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response)

      await expect(
        sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        }),
      ).rejects.toThrow('Failed to send email: Internal Server Error')
    })
  })

  describe('notifyBorrowRequest', () => {
    it('sends borrow request email with correct params', async () => {
      await notifyBorrowRequest({
        ownerEmail: 'owner@example.com',
        ownerName: 'Owner Name',
        borrowerName: 'Borrower Name',
        bookTitle: 'Test Book',
        bookId: 1,
      })
    })
  })

  describe('notifyRequestApproved', () => {
    it('sends approval email with correct params', async () => {
      await notifyRequestApproved({
        borrowerEmail: 'borrower@example.com',
        borrowerName: 'Borrower Name',
        ownerName: 'Owner Name',
        bookTitle: 'Test Book',
      })
    })
  })

  describe('notifyRequestRejected', () => {
    it('sends rejection email with correct params', async () => {
      await notifyRequestRejected({
        borrowerEmail: 'borrower@example.com',
        borrowerName: 'Borrower Name',
        ownerName: 'Owner Name',
        bookTitle: 'Test Book',
      })
    })
  })

  describe('notifyReturnPending', () => {
    it('sends return pending email with correct params', async () => {
      await notifyReturnPending({
        ownerEmail: 'owner@example.com',
        ownerName: 'Owner Name',
        borrowerName: 'Borrower Name',
        bookTitle: 'Test Book',
      })
    })
  })

  describe('notifyReturnConfirmed', () => {
    it('sends return confirmed email with correct params', async () => {
      await notifyReturnConfirmed({
        borrowerEmail: 'borrower@example.com',
        borrowerName: 'Borrower Name',
        ownerName: 'Owner Name',
        bookTitle: 'Test Book',
      })
    })
  })
})
