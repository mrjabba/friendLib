import './globals.css'

import { ClerkProvider } from '@clerk/nextjs'
import { GeistSans } from 'geist/font/sans'

import { I18nProvider } from '@/i18n/I18nProvider'
import { getTranslations } from '@/i18n/dictionaries'
import { translate } from '@/i18n/config'

export async function generateMetadata() {
  const { locale, dict } = await getTranslations()
  const title = translate(dict, locale, 'app.title')
  const description = translate(dict, locale, 'app.tagline')

  return {
    title,
    description,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    metadataBase: new URL('https://friendlib.app'),
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dict } = await getTranslations()

  return (
    <ClerkProvider>
      <html lang={locale}>
        <body className={GeistSans.variable}>
          <I18nProvider locale={locale} dict={dict}>
            {children}
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
