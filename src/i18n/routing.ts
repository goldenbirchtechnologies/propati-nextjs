export const locales = ['en', 'yo', 'ig', 'ha', 'fr'] as const
export const defaultLocale = 'en'

export const routing = {
  locales,
  defaultLocale,
  localePrefix: 'always' as const,
}
