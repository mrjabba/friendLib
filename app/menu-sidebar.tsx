'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'

import { useTranslations } from '@/i18n/I18nProvider'
import LanguageSwitcher from '@/i18n/LanguageSwitcher'

export default function MenuSidebar() {
  const t = useTranslations()
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return <div className="my-5 px-8">{t('common.loading')}</div>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <>
      <ul className="my-5 px-8 md:text-xl">
        <li>
          <button className="py-2">
            <Link href="/">{t('nav.home')}</Link>
          </button>
        </li>
        <li>
          <button className="py-2">
            <Link href="/actions/book-add">{t('nav.add')}</Link>
          </button>
        </li>
        <li>
          <button className="py-2">
            <Link href="/actions/book-search">{t('nav.search')}</Link>
          </button>
        </li>
        <li className="pt-4 border-t border-gray-300 mt-2">
          <span className="text-sm text-gray-500">{t('nav.borrowing')}</span>
        </li>
        <li>
          <button className="py-2">
            <Link href="/actions/my-borrows">{t('nav.myBorrows')}</Link>
          </button>
        </li>
        <li className="pt-4 border-t border-gray-300 mt-2">
          <span className="text-sm text-gray-500">{t('nav.managing')}</span>
        </li>
        <li>
          <button className="py-2">
            <Link href="/actions/borrow-requests">{t('nav.borrowRequests')}</Link>
          </button>
        </li>
        <li>
          <button className="py-2">
            <Link href="/actions/return-confirmation">{t('nav.returns')}</Link>
          </button>
        </li>
        <li className="pt-4">
          <UserButton />
        </li>
        <li className="pt-6 border-t border-gray-300 mt-2">
          <LanguageSwitcher />
        </li>
      </ul>
    </>
  )
}
