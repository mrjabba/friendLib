import { render as rtlRender } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'

import en from '@/i18n/dictionaries/en.json'
import { I18nProvider } from '@/i18n/I18nProvider'
import type { Locale } from '@/i18n/config'

import es from '@/i18n/dictionaries/es.json'
import fr from '@/i18n/dictionaries/fr.json'
import de from '@/i18n/dictionaries/de.json'

const dictionaries = { en, es, fr, de }

interface Options extends Omit<RenderOptions, 'wrapper'> {
  locale?: Locale
}

/**
 * Renders a component inside the i18n provider, which every client component
 * that calls `useTranslations()` needs. Defaults to English; pass a locale to
 * assert translated output.
 */
export function render(ui: React.ReactElement, { locale = 'en', ...options }: Options = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <I18nProvider locale={locale} dict={dictionaries[locale]}>
        {children}
      </I18nProvider>
    ),
    ...options,
  })
}
