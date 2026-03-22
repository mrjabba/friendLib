interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Email] Sending email:')
    console.log(`  To: ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Body: ${html.substring(0, 100)}...`)
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not set, skipping email')
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'noreply@friendlib.app',
      to,
      subject,
      html,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`)
  }
}

export async function notifyBorrowRequest(params: {
  ownerEmail: string
  ownerName: string
  borrowerName: string
  bookTitle: string
  bookId: number
}): Promise<void> {
  const { ownerEmail, ownerName, borrowerName, bookTitle } = params
  await sendEmail({
    to: ownerEmail,
    subject: `Borrow Request: ${bookTitle}`,
    html: `
      <h1>New Borrow Request</h1>
      <p>Hi ${ownerName},</p>
      <p><strong>${borrowerName}</strong> would like to borrow your book "<strong>${bookTitle}</strong>".</p>
      <p>Please log in to approve or reject this request.</p>
    `,
  })
}

export async function notifyRequestApproved(params: {
  borrowerEmail: string
  borrowerName: string
  ownerName: string
  bookTitle: string
}): Promise<void> {
  const { borrowerEmail, borrowerName, ownerName, bookTitle } = params
  await sendEmail({
    to: borrowerEmail,
    subject: `Approved: ${bookTitle}`,
    html: `
      <h1>Borrow Request Approved</h1>
      <p>Hi ${borrowerName},</p>
      <p>Great news! <strong>${ownerName}</strong> has approved your borrow request for "<strong>${bookTitle}</strong>".</p>
      <p>Please coordinate with the owner to pick up the book.</p>
    `,
  })
}

export async function notifyRequestRejected(params: {
  borrowerEmail: string
  borrowerName: string
  ownerName: string
  bookTitle: string
}): Promise<void> {
  const { borrowerEmail, borrowerName, ownerName, bookTitle } = params
  await sendEmail({
    to: borrowerEmail,
    subject: `Rejected: ${bookTitle}`,
    html: `
      <h1>Borrow Request Rejected</h1>
      <p>Hi ${borrowerName},</p>
      <p>Unfortunately, <strong>${ownerName}</strong> has rejected your borrow request for "<strong>${bookTitle}</strong>".</p>
      <p>Feel free to browse other available books.</p>
    `,
  })
}

export async function notifyReturnPending(params: {
  ownerEmail: string
  ownerName: string
  borrowerName: string
  bookTitle: string
}): Promise<void> {
  const { ownerEmail, ownerName, borrowerName, bookTitle } = params
  await sendEmail({
    to: ownerEmail,
    subject: `Return Pending: ${bookTitle}`,
    html: `
      <h1>Book Return Pending Confirmation</h1>
      <p>Hi ${ownerName},</p>
      <p><strong>${borrowerName}</strong> has marked "<strong>${bookTitle}</strong>" as returned.</p>
      <p>Please confirm once you have received the book back.</p>
    `,
  })
}

export async function notifyReturnConfirmed(params: {
  borrowerEmail: string
  borrowerName: string
  ownerName: string
  bookTitle: string
}): Promise<void> {
  const { borrowerEmail, borrowerName, ownerName, bookTitle } = params
  await sendEmail({
    to: borrowerEmail,
    subject: `Return Confirmed: ${bookTitle}`,
    html: `
      <h1>Book Return Confirmed</h1>
      <p>Hi ${borrowerName},</p>
      <p><strong>${ownerName}</strong> has confirmed the return of "<strong>${bookTitle}</strong>".</p>
      <p>Thank you for borrowing! The book is now available for others to request.</p>
    `,
  })
}
