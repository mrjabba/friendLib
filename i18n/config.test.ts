import { describe, it, expect } from 'vitest'

import { isLocale, locales, localeNames, translate } from './config'
import type { Dictionary } from './config'

import en from './dictionaries/en.json'
import es from './dictionaries/es.json'
import fr from './dictionaries/fr.json'
import de from './dictionaries/de.json'

const dictionaries = { en, es, fr, de }

describe('isLocale', () => {
  it('accepts every supported locale', () => {
    for (const locale of locales) {
      expect(isLocale(locale)).toBe(true)
    }
  })

  it('rejects unsupported, empty and missing values', () => {
    expect(isLocale('it')).toBe(false)
    expect(isLocale('en-US')).toBe(false)
    expect(isLocale('')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
    expect(isLocale(null)).toBe(false)
  })
})

describe('translate', () => {
  it('returns the string for a known key', () => {
    expect(translate(en, 'en', 'nav.home')).toBe('Home')
    expect(translate(de, 'de', 'nav.home')).toBe('Startseite')
  })

  it('interpolates named placeholders', () => {
    expect(translate(en, 'en', 'dashboard.loggedInAs', { email: 'a@b.com' })).toBe(
      'Logged in as: a@b.com',
    )
  })

  it('interpolates numbers as well as strings', () => {
    expect(translate(en, 'en', 'search.results', { count: 3 })).toBe('Results (3)')
  })

  it('leaves a placeholder untouched when no value is supplied', () => {
    expect(translate(en, 'en', 'dashboard.loggedInAs')).toBe('Logged in as: {email}')
  })

  it('returns the key itself for an unknown key so gaps are visible', () => {
    expect(translate(en, 'en', 'nope.missing')).toBe('nope.missing')
  })

  it('selects the singular plural category for a count of one', () => {
    expect(translate(en, 'en', 'book.count', { count: 1 })).toBe('1 book')
    expect(translate(de, 'de', 'book.count', { count: 1 })).toBe('1 Buch')
  })

  it('selects the plural category for other counts', () => {
    expect(translate(en, 'en', 'book.count', { count: 0 })).toBe('0 books')
    expect(translate(en, 'en', 'book.count', { count: 7 })).toBe('7 books')
    expect(translate(es, 'es', 'book.count', { count: 2 })).toBe('2 libros')
  })

  it('treats a French count of zero as singular, following French plural rules', () => {
    // Intl.PluralRules('fr').select(0) === 'one', unlike English.
    expect(translate(fr, 'fr', 'book.count', { count: 0 })).toBe('0 livre')
    expect(translate(fr, 'fr', 'book.count', { count: 2 })).toBe('2 livres')
  })

  it('falls back to the "other" form when a locale lacks the selected category', () => {
    const sparse = { 'x.count.other': '{count} items' } as unknown as Dictionary
    expect(translate(sparse, 'en', 'x.count', { count: 1 })).toBe('1 items')
  })
})

describe('dictionaries', () => {
  it('has a native name for every locale', () => {
    for (const locale of locales) {
      expect(localeNames[locale]).toBeTruthy()
    }
  })

  it('defines exactly the same keys in every locale', () => {
    const expected = Object.keys(en).sort()
    for (const locale of locales) {
      expect(Object.keys(dictionaries[locale]).sort(), `locale ${locale}`).toEqual(expected)
    }
  })

  it('has no empty translations', () => {
    for (const locale of locales) {
      for (const [key, value] of Object.entries(dictionaries[locale])) {
        expect(value.trim(), `${locale}:${key}`).not.toBe('')
      }
    }
  })

  it('uses the same placeholders in every locale as in English', () => {
    const placeholders = (text: string) => (text.match(/\{(\w+)\}/g) ?? []).sort()

    for (const locale of locales) {
      const dict = dictionaries[locale] as Record<string, string>
      for (const [key, englishText] of Object.entries(en)) {
        expect(placeholders(dict[key]), `${locale}:${key}`).toEqual(placeholders(englishText))
      }
    }
  })
})
