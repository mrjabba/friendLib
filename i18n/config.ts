import type en from './dictionaries/en.json'

export type Dictionary = typeof en
export type TranslationKey = keyof Dictionary

export const locales = ['en', 'es', 'fr', 'de'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** Cookie that persists the visitor's chosen locale. Readable on server and client. */
export const LOCALE_COOKIE = 'locale'

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}

/** Native language names for the language switcher. */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
}

export type TranslateVars = Record<string, string | number>

/**
 * Look up `key` in `dict` and interpolate `{placeholders}`.
 * When `vars.count` is present and the key itself is absent, the plural
 * category (`<key>.one`, `<key>.other`, ...) is selected with Intl.PluralRules
 * so each locale gets its own plural rules for free.
 * An unknown key returns the key itself, which makes gaps obvious in the UI.
 */
export function translate(
  dict: Dictionary,
  locale: Locale,
  key: string,
  vars?: TranslateVars,
): string {
  const entries = dict as Record<string, string>
  let template = entries[key]

  if (template === undefined && vars?.count !== undefined) {
    const category = new Intl.PluralRules(locale).select(Number(vars.count))
    template = entries[`${key}.${category}`] ?? entries[`${key}.other`]
  }

  if (template === undefined) return key

  return template.replace(/\{(\w+)\}/g, (match, name) => {
    const value = vars?.[name]
    return value === undefined ? match : String(value)
  })
}
