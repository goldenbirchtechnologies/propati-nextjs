'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard } from 'lucide-react'

interface AuthNavButtonsProps {
  locale: string
  userRole: string | null
}

function rolePath(role: string): string {
  if (role === 'estate_manager') return 'estate-manager'
  return role
}

export default function AuthNavButtons({ locale, userRole }: AuthNavButtonsProps) {
  if (userRole) {
    // User is signed in — show Dashboard button + UserButton
    const dashboardHref = `/${locale}/${rolePath(userRole)}`

    return (
      <>
        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <UserButton
          afterSignOutUrl={`/${locale}`}
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8',
            },
          }}
        />
      </>
    )
  }

  // User is NOT signed in — show Sign In + Get Started
  return (
    <>
      <Link
        href={`/${locale}/sign-in`}
        className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#2563EB]"
      >
        Sign In
      </Link>
      <Link
        href={`/${locale}/sign-up`}
        className="rounded-full bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
      >
        Get Started
      </Link>
    </>
  )
}
