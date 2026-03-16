'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import {
  Home, Building2, PlusCircle, FileText, MessageSquare,
  Shield, User, CreditCard, Search, Wrench, Users,
  BarChart3, Upload, Flag, AlertTriangle, DollarSign,
  Phone, LogOut,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const roleNavItems: Record<string, NavItem[]> = {
  landlord: [
    { label: 'Overview', href: '', icon: Home },
    { label: 'My Listings', href: '/listings', icon: Building2 },
    { label: 'Add Listing', href: '/listings/new', icon: PlusCircle },
    { label: 'Agreements', href: '/agreements', icon: FileText },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Screening', href: '/screening', icon: Phone },
    { label: 'Rent Collection', href: '/rent', icon: CreditCard },
    { label: 'Verify Property', href: '/verify', icon: Shield },
    { label: 'Profile', href: '/profile', icon: User },
  ],
  tenant: [
    { label: 'Home', href: '', icon: Home },
    { label: 'Find Property', href: '/search', icon: Search },
    { label: 'Agreements', href: '/agreements', icon: FileText },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    { label: 'Maintenance', href: '/maintenance', icon: Wrench },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Profile', href: '/profile', icon: User },
  ],
  agent: [
    { label: 'Dashboard', href: '', icon: Home },
    { label: 'Listings', href: '/listings', icon: Building2 },
    { label: 'Pipeline', href: '/pipeline', icon: BarChart3 },
    { label: 'Commissions', href: '/commissions', icon: DollarSign },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Profile', href: '/profile', icon: User },
  ],
  admin: [
    { label: 'Console', href: '', icon: Home },
    { label: 'Verification Queue', href: '/verification', icon: Shield },
    { label: 'Flagged Listings', href: '/flags', icon: Flag },
    { label: 'Disputes', href: '/disputes', icon: AlertTriangle },
    { label: 'Users', href: '/users', icon: Users },
    { label: 'Revenue', href: '/revenue', icon: DollarSign },
  ],
  estate_manager: [
    { label: 'Portfolio', href: '', icon: Home },
    { label: 'Rent Ledger', href: '/ledger', icon: CreditCard },
    { label: 'Maintenance', href: '/maintenance', icon: Wrench },
    { label: 'Team', href: '/team', icon: Users },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Bulk Import', href: '/bulk-upload', icon: Upload },
    { label: 'Profile', href: '/profile', icon: User },
  ],
}

const roleThemeClass: Record<string, string> = {
  landlord: 'text-gold',
  tenant: 'text-teal',
  agent: 'text-rust',
  admin: 'text-red-600',
  estate_manager: 'text-blue-600',
}

function rolePath(role: string): string {
  if (role === 'estate_manager') return 'estate-manager'
  return role
}

export default function Sidebar({ role, locale }: { role: string; locale: string }) {
  const pathname = usePathname()
  const items = roleNavItems[role] ?? roleNavItems.tenant
  const basePath = `/${locale}/${rolePath(role)}`

  return (
    <aside className="hidden w-[240px] flex-col border-r bg-white md:flex">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-5">
        <Link href={`/${locale}/`} className="font-display text-xl font-bold text-gold">
          PROPATI
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3">
        <span
          className={cn(
            'inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            roleThemeClass[role] ?? 'text-gray-600'
          )}
        >
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
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}

export { roleNavItems, rolePath }
