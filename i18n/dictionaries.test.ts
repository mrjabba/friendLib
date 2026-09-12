import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCookieGet, mockHeaderGet } = vi.hoisted(() => ({
  mockCookieGet: vi.fn(),
  mockHeaderGet: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: mockCookieGet }),
  headers: async () => ({ get: mockHeaderGet }),
}))

import { getDictionary, getRequestLocale, getTranslations } from './dictionaries'

/** No locale cookie, and the given `Accept-Language` header. */
function request({ cookie, acceptLanguage }: { cookie?: string; acceptLanguage?: string } = {}) {
  mockCookieGet.mockReturnValue(cookie ? { value: cookie } : undefined)
  mockHeaderGet.mockReturnValue(acceptLanguage ?? null)
}

describe('getDictionary', () => {
  it('loads each locale with its own translations', async () => {
    expect((await getDictionary('en'))['nav.home']).toBe('Home')
    expect((await getDictionary('es'))['nav.home']).toBe('Inicio')
    expect((await getDictionary('fr'))['nav.home']).toBe('Accueil')
    expect((await getDictionary('de'))['nav.home']).toBe('Startseite')
  })
})

describe('getRequestLocale', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prefers an explicit cookie choice over the browser header', async () => {
    request({ cookie: 'de', acceptLanguage: 'fr-FR,fr;q=0.9' })
    expect(await getRequestLocale()).toBe('de')
  })

  it('ignores a cookie holding an unsupported locale', async () => {
    request({ cookie: 'it', acceptLanguage: 'fr-FR,fr;q=0.9' })
    expect(await getRequestLocale()).toBe('fr')
  })

  it('falls back to the browser header when no cookie is set', async () => {
    request({ acceptLanguage: 'es-MX,es;q=0.9,en;q=0.8' })
    expect(await getRequestLocale()).toBe('es')
  })

  it('matches a region-tagged language to its base language', async () => {
    request({ acceptLanguage: 'de-AT' })
    expect(await getRequestLocale()).toBe('de')
  })

  it('honours quality values rather than header order', async () => {
    request({ acceptLanguage: 'en;q=0.2,fr;q=0.9' })
    expect(await getRequestLocale()).toBe('fr')
  })

  it('skips languages it does not support and takes the next best', async () => {
    request({ acceptLanguage: 'it-IT,it;q=0.9,de;q=0.5' })
    expect(await getRequestLocale()).toBe('de')
  })

  it('defaults to English when the header offers nothing supported', async () => {
    request({ acceptLanguage: 'it-IT,ja;q=0.8' })
    expect(await getRequestLocale()).toBe('en')
  })

  it('defaults to English when there is no cookie and no header', async () => {
    request()
    expect(await getRequestLocale()).toBe('en')
  })

  it('ignores the wildcard language range', async () => {
    request({ acceptLanguage: '*' })
    expect(await getRequestLocale()).toBe('en')
  })
})

describe('getTranslations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the locale alongside its dictionary', async () => {
    request({ cookie: 'es' })
    const { locale, dict, locales } = await getTranslations()

    expect(locale).toBe('es')
    expect(dict['nav.home']).toBe('Inicio')
    expect(locales).toContain('es')
  })
})
