'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'

import { translate, LOCALE_COOKIE } from './config'
import type { Dictionary, Locale, TranslateVars } from './config'

interface I18nValue {
  locale: Locale
  dict: Dictionary
  t: (key: string, vars?: TranslateVars) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nValue | null>(null)

/**
 * Holds the active locale and its dictionary for client components. The
 * dictionary is loaded on the server and handed down, so no translation
 * fetching happens in the browser.
 */
export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale
  dict: Dictionary
  children: React.ReactNode
}) {
  const setLocale = useCallback((next: Locale) => {
    // One year, site-wide, so the choice survives navigation and reloads.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    // Full reload re-renders the server components with the new dictionary.
    window.location.reload()
  }, [])

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dict,
      t: (key, vars) => translate(dict, locale, key, vars),
      setLocale,
    }),
    [locale, dict, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/** Translation helpers for client components. Must be used under I18nProvider. */
export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return value
}

/** Shorthand for the common case of only needing the translate function. */
export function useTranslations() {
  return useI18n().t
}
