'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { X, LogOut } from 'lucide-react'
import { roleNavItems, rolePath } from './Sidebar'

interface MobileNavProps {
  role: string
  locale: string
  open: boolean
  onClose: () => void
}

export default function MobileNav({ role, locale, open, onClose }: MobileNavProps) {
  const pathname = usePathname()
  const items = roleNavItems[role] ?? roleNavItems.tenant
  const basePath = `/${locale}/${rolePath(role)}`

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-white shadow-xl md:hidden">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="font-display text-xl font-bold text-gold">PROPATI</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3">
          <span className="inline-block rounded-full bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
            {role === 'estate_manager' ? 'Estate Manager' : role}
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {items.map((item) => {
            const href = `${basePath}${item.href}`
            const isActive = pathname === href || (item.href !== '' && pathname.startsWith(href + '/'))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t p-3">
          <SignOutButton>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    </>
  )
}
