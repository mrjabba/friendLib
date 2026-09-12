import Image from 'next/image'

import { getTranslations } from '@/i18n/dictionaries'
import { translate } from '@/i18n/config'

export default async function Header() {
  const { locale, dict } = await getTranslations()

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b">
      <h1 className="text-2xl font-bold">{translate(dict, locale, 'app.title')}</h1>
      <Image src="/images/book-logo-small.png" alt="logo-small" width={75} height={75} />
    </header>
  )
}
