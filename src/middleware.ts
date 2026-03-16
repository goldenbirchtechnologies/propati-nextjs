import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/routing'

const handleI18n = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

const localePrefix = '/(en|yo|ig|ha|fr)'

const isPublicRoute = createRouteMatcher([
  '/', `${localePrefix}/`,
  '/listings(.*)', `${localePrefix}/listings(.*)`,
  '/sign-in(.*)', '/sign-up(.*)',
  `${localePrefix}/sign-in(.*)`, `${localePrefix}/sign-up(.*)`,
  '/sign/(.*)', `${localePrefix}/sign/(.*)`,
  '/api/webhooks(.*)',
  '/api/payments/webhook',
  '/api/listings(.*)',
  '/api/sign(.*)',
  `${localePrefix}/onboarding(.*)`,
  '/onboarding(.*)',
])

const isAuthPage = createRouteMatcher([
  '/sign-in(.*)', '/sign-up(.*)',
  `${localePrefix}/sign-in(.*)`, `${localePrefix}/sign-up(.*)`,
])

export default clerkMiddleware((auth, req) => {
  const { userId } = auth()

  // Redirect signed-in users away from sign-in/sign-up pages
  if (userId && isAuthPage(req)) {
    const locale = req.nextUrl.pathname.match(/^\/(en|yo|ig|ha|fr)/)?.[1] ?? 'en'
    return Response.redirect(new URL(`/${locale}/onboarding`, req.url))
  }

  // Only protect non-public routes — Clerk will redirect to sign-in
  if (!isPublicRoute(req)) {
    auth().protect()
  }

  // After Clerk auth is satisfied, run i18n middleware
  return handleI18n(req)
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
