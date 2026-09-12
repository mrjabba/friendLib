'use client'

import { locales, localeNames, isLocale } from './config'
import { useI18n } from './I18nProvider'

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <label className="block text-sm">
      <span className="text-gray-500">{t('common.language')}</span>
      <select
        value={locale}
        onChange={(e) => isLocale(e.target.value) && setLocale(e.target.value)}
        className="mt-1 w-full rounded border border-stone-600 bg-stone-800 px-2 py-1 text-stone-50"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {localeNames[code]}
          </option>
        ))}
      </select>
    </label>
  )
}
