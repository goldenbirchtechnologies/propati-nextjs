'use client'

import Image from 'next/image'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { Menu, ExternalLink } from 'lucide-react'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'

interface TopbarProps {
  fullName: string
  avatarUrl: string | null
  email: string
  locale: string
  onMenuClick: () => void
}

export default function Topbar({ fullName, locale, onMenuClick }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4 md:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Greeting — desktop only */}
      <p className="hidden text-sm text-muted-foreground md:block">
        Welcome, <span className="font-medium text-foreground">{fullName}</span>
      </p>

      {/* Mobile logo */}
      <Link href={`/${locale}/`} className="md:hidden">
        <Image src="/logo.svg" alt="myPROPATi" width={100} height={24} priority />
      </Link>

      {/* Back to Website + Language + User */}
      <div className="flex items-center gap-2">
        <Link
          href={`/${locale}/`}
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Website
        </Link>
        <LanguageSwitcher variant="light" />
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8',
            },
          }}
        />
      </div>
    </header>
  )
}
