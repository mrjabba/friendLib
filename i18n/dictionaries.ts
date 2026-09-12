import 'server-only'

import { cookies, headers } from 'next/headers'

import { defaultLocale, isLocale, locales, LOCALE_COOKIE, translate } from './config'
import type { Dictionary, Locale, TranslateVars } from './config'

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  es: () => import('./dictionaries/es.json').then((m) => m.default),
  fr: () => import('./dictionaries/fr.json').then((m) => m.default),
  de: () => import('./dictionaries/de.json').then((m) => m.default),
}

export const getDictionary = (locale: Locale): Promise<Dictionary> => dictionaries[locale]()

/** Best locale from the `Accept-Language` header, ignoring region subtags. */
function localeFromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.find((p) => p.trim().startsWith('q='))
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.split('=')[1]) : 1 }
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    const language = tag.split('-')[0]
    if (isLocale(language)) return language
  }
  return undefined
}

/**
 * The locale for this request: an explicit cookie choice wins, otherwise the
 * browser's `Accept-Language` preference, otherwise the default locale.
 */
export async function getRequestLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value
  if (isLocale(cookieLocale)) return cookieLocale

  return localeFromAcceptLanguage((await headers()).get('accept-language')) ?? defaultLocale
}

/** Locale plus its dictionary, for server components. */
export async function getTranslations() {
  const locale = await getRequestLocale()
  return { locale, dict: await getDictionary(locale), locales }
}

/**
 * Server-component translate function bound to the request's locale, mirroring
 * `useTranslations()` on the client.
 */
export async function getT() {
  const { locale, dict } = await getTranslations()
  const t = (key: string, vars?: TranslateVars) => translate(dict, locale, key, vars)
  return { t, locale }
}
