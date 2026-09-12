import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { I18nProvider, useI18n, useTranslations } from './I18nProvider'
import LanguageSwitcher from './LanguageSwitcher'
import en from './dictionaries/en.json'
import de from './dictionaries/de.json'

function Greeting() {
  const t = useTranslations()
  return <p>{t('book.count', { count: 2 })}</p>
}

function LocaleLabel() {
  const { locale } = useI18n()
  return <p>{locale}</p>
}

describe('I18nProvider', () => {
  const reload = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    document.cookie = 'locale=; path=/; max-age=0'
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('translates using the dictionary it is given', () => {
    render(
      <I18nProvider locale="de" dict={de}>
        <Greeting />
      </I18nProvider>,
    )
    expect(screen.getByText('2 Bücher')).toBeInTheDocument()
  })

  it('exposes the active locale', () => {
    render(
      <I18nProvider locale="fr" dict={en}>
        <LocaleLabel />
      </I18nProvider>,
    )
    expect(screen.getByText('fr')).toBeInTheDocument()
  })

  it('throws a helpful error when used outside the provider', () => {
    // React logs the thrown render error; silence it for this expected failure.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Greeting />)).toThrow(/must be used within an I18nProvider/)
    consoleError.mockRestore()
  })
})

describe('LanguageSwitcher', () => {
  const reload = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    document.cookie = 'locale=; path=/; max-age=0'
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload },
      writable: true,
    })
  })

  function renderSwitcher() {
    return render(
      <I18nProvider locale="en" dict={en}>
        <LanguageSwitcher />
      </I18nProvider>,
    )
  }

  it('lists every supported language by its native name', () => {
    renderSwitcher()
    for (const name of ['English', 'Español', 'Français', 'Deutsch']) {
      expect(screen.getByRole('option', { name })).toBeInTheDocument()
    }
  })

  it('preselects the active locale', () => {
    renderSwitcher()
    expect(screen.getByRole('combobox')).toHaveValue('en')
  })

  it('persists the chosen locale in a cookie and reloads', async () => {
    renderSwitcher()
    await userEvent.selectOptions(screen.getByRole('combobox'), 'fr')

    expect(document.cookie).toContain('locale=fr')
    expect(reload).toHaveBeenCalled()
  })
})
