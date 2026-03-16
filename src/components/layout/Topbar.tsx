'use client'

import { UserButton } from '@clerk/nextjs'
import { Menu } from 'lucide-react'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'

interface TopbarProps {
  fullName: string
  avatarUrl: string | null
  email: string
  locale: string
  onMenuClick: () => void
}

export default function Topbar({ fullName, onMenuClick }: TopbarProps) {
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
      <span className="font-display text-lg font-bold text-gold md:hidden">PROPATI</span>

      {/* Language + User */}
      <div className="flex items-center gap-2">
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
