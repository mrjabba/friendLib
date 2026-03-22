import './globals.css'

import { ClerkProvider } from '@clerk/nextjs'
import { GeistSans } from 'geist/font/sans'

export const metadata = {
  title: 'Friend Lib',
  description: 'Search, borrow and loan books with friends.',
  twitter: {
    card: 'summary_large_image',
    title: 'Friend Lib',
    description: 'Search, borrow and loan books with friends.',
  },
  metadataBase: new URL('https://friendlib.app'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={GeistSans.variable}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
