import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import QueryProvider from '@/components/providers/QueryProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'PROPATI — Nigeria\'s Verified Property Platform',
  description: 'Find verified properties to rent, buy, or short-let across Nigeria. Every listing screened with our 5-layer verification.',
  openGraph: {
    title: 'PROPATI — Nigeria\'s Verified Property Platform',
    description: 'Find verified properties to rent, buy, or short-let across Nigeria. Every listing screened with our 5-layer verification.',
    siteName: 'PROPATI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROPATI — Nigeria\'s Verified Property Platform',
    description: 'Find verified properties to rent, buy, or short-let across Nigeria.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/en/onboarding"
      signUpFallbackRedirectUrl="/en/onboarding"
      signInUrl="/en/sign-in"
      signUpUrl="/en/sign-up"
    >
      <html lang="en">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Outfit:wght@400;500;600;700;800&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="font-sans antialiased">
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
