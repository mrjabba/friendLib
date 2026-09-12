# Internationalization

English, Spanish, French and German, with no i18n dependency. Every user-facing
string lives in `dictionaries/<locale>.json` under a flat dotted key.

## Adding or changing a string

1. Add the key to `dictionaries/en.json`, then to `es`, `fr` and `de`.
   `config.test.ts` fails if the locales drift apart or a placeholder is missing.
2. Use it in a client component with the `useTranslations()` hook, or in a
   server component with `await getT()`.

```tsx
// client component
const t = useTranslations()
return <h2>{t('bookAdd.heading')}</h2>

// server component
const { t } = await getT()
return <h2>{t('bookAdd.heading')}</h2>
```

Placeholders interpolate by name: `t('dashboard.loggedInAs', { email })` against
`"Logged in as: {email}"`. An unknown key renders as the key itself, so gaps are
visible rather than silent.

## Plurals

Give the key `.one` and `.other` variants and pass a `count`. The right form is
chosen with `Intl.PluralRules` for the active locale, so French treats zero as
singular without any extra code.

```json
"book.count.one": "{count} book",
"book.count.other": "{count} books"
```

```tsx
t('book.count', { count: books.length })
```

## Dates and numbers

Format with the active locale rather than the machine default:
`new Date(value).toLocaleDateString(locale)`, where `locale` comes from
`useI18n()` or `getT()`.

## How a locale is chosen

`getRequestLocale()` prefers the `locale` cookie set by the language switcher,
falls back to the browser's `Accept-Language` header, then to English. The root
layout resolves it once per request, stamps `<html lang>`, and passes the
dictionary to `I18nProvider` so client components translate without fetching
anything.

## Adding a language

Add the code to `locales` and a native name to `localeNames` in `config.ts`, add
a loader entry in `dictionaries.ts`, and copy `en.json` to the new file and
translate it. Nothing else changes.

## Tests

`test/utils/render.tsx` wraps components in the provider. Pass a locale to
assert translated output: `render(<Page />, { locale: 'de' })`.

## If this outgrows itself

Rich message formatting (gender, nested selects, relative time) is the point to
move to `next-intl`. The dictionaries are already flat ICU-style keys, so the
migration is mostly mechanical.
