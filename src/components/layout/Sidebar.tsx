'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { useTenantMode, type TenantMode } from '@/components/providers/TenantModeProvider'
import {
  Home, Building2, PlusCircle, FileText, MessageSquare,
  Shield, User, CreditCard, Search, Wrench, Users,
  BarChart3, Upload, Flag, AlertTriangle, DollarSign,
  Phone, LogOut, Heart, Receipt, Wallet, ShoppingCart,
  Calculator, ArrowRightLeft, Calendar, Handshake,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

// ── Tenant mode-specific sidebar sections ──
const tenantModeSections: Record<TenantMode, NavSection[]> = {
  rent: [
    {
      title: 'HOME',
      items: [
        { label: 'Dashboard', href: '', icon: Home },
        { label: 'Find Property', href: '/search', icon: Search },
      ],
    },
    {
      title: 'MY TENANCY',
      items: [
        { label: 'Rent & Payments', href: '/payments', icon: CreditCard },
        { label: 'My Agreements', href: '/agreements', icon: FileText },
        { label: 'Maintenance', href: '/maintenance', icon: Wrench },
        { label: 'Screening Call', href: '/screening', icon: Phone },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: 'My Profile', href: '/profile', icon: User },
        { label: 'Receipts', href: '/receipts', icon: Receipt },
        { label: 'Messages', href: '/messages', icon: MessageSquare },
      ],
    },
  ],
  buy: [
    {
      title: 'HOME',
      items: [
        { label: 'Dashboard', href: '', icon: Home },
        { label: 'Find Property', href: '/search', icon: Search },
      ],
    },
    {
      title: 'MY PURCHASE',
      items: [
        { label: 'My Offers', href: '/offers', icon: ShoppingCart },
        { label: 'Mortgage Calculator', href: '/mortgage', icon: Calculator },
        { label: 'Title Transfer', href: '/title-transfer', icon: ArrowRightLeft },
        { label: 'Sale Agreements', href: '/agreements', icon: FileText },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: 'My Profile', href: '/profile', icon: User },
        { label: 'Receipts', href: '/receipts', icon: Receipt },
        { label: 'Messages', href: '/messages', icon: MessageSquare },
      ],
    },
  ],
  shortlet: [
    {
      title: 'HOME',
      items: [
        { label: 'Dashboard', href: '', icon: Home },
        { label: 'Find Property', href: '/search', icon: Search },
      ],
    },
    {
      title: 'MY BOOKINGS',
      items: [
        { label: 'My Bookings', href: '/bookings', icon: Calendar },
        { label: 'Payments', href: '/payments', icon: CreditCard },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: 'My Profile', href: '/profile', icon: User },
        { label: 'Receipts', href: '/receipts', icon: Receipt },
        { label: 'Messages', href: '/messages', icon: MessageSquare },
      ],
    },
  ],
  share: [
    {
      title: 'HOME',
      items: [
        { label: 'Dashboard', href: '', icon: Home },
        { label: 'Find Property', href: '/search', icon: Search },
      ],
    },
    {
      title: 'ROOM SHARE',
      items: [
        { label: 'Roommate Matches', href: '/roommates', icon: Handshake },
        { label: 'Share Agreement', href: '/agreements', icon: FileText },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: 'My Profile', href: '/profile', icon: User },
        { label: 'Receipts', href: '/receipts', icon: Receipt },
        { label: 'Messages', href: '/messages', icon: MessageSquare },
      ],
    },
  ],
}

// ── Other roles: flat nav (no sections) ──
const roleNavItems: Record<string, NavItem[]> = {
  landlord: [
    { label: 'Overview', href: '', icon: Home },
    { label: 'My Listings', href: '/listings', icon: Building2 },
    { label: 'Add Listing', href: '/listings/new', icon: PlusCircle },
    { label: 'Agreements', href: '/agreements', icon: FileText },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Screening', href: '/screening', icon: Phone },
    { label: 'Rent Collection', href: '/rent', icon: CreditCard },
    { label: 'Withdrawals', href: '/withdrawals', icon: Wallet },
    { label: 'Verify Property', href: '/verify', icon: Shield },
    { label: 'Profile', href: '/profile', icon: User },
  ],
  agent: [
    { label: 'Dashboard', href: '', icon: Home },
    { label: 'Listings', href: '/listings', icon: Building2 },
    { label: 'Pipeline', href: '/pipeline', icon: BarChart3 },
    { label: 'Commissions', href: '/commissions', icon: DollarSign },
    { label: 'Withdrawals', href: '/withdrawals', icon: Wallet },
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

function NavLink({
  item,
  basePath,
  pathname,
}: {
  item: NavItem
  basePath: string
  pathname: string
}) {
  const href = `${basePath}${item.href}`
  const isActive = pathname === href || (item.href !== '' && pathname.startsWith(href + '/'))
  const Icon = item.icon

  return (
    <Link
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
      {item.badge && item.badge > 0 && (
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {item.badge > 9 ? '9+' : item.badge}
        </span>
      )}
    </Link>
  )
}

export default function Sidebar({ role, locale }: { role: string; locale: string }) {
  const pathname = usePathname()
  const basePath = `/${locale}/${rolePath(role)}`
  const { mode } = useTenantMode()

  // Tenant uses sectioned sidebar based on mode
  if (role === 'tenant') {
    const sections = tenantModeSections[mode] ?? tenantModeSections.rent

    return (
      <aside className="hidden w-[240px] flex-col border-r bg-white md:flex">
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-5">
          <Link href={`/${locale}/`} className="font-display text-xl font-bold text-gold">
            PROPATI
          </Link>
        </div>

        {/* Sectioned nav */}
        <nav className="flex-1 overflow-y-auto px-3 pt-3">
          {sections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.href} item={item} basePath={basePath} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}
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

  // All other roles: flat nav
  const items = roleNavItems[role] ?? roleNavItems.landlord

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
        {items.map((item) => (
          <NavLink key={item.href} item={item} basePath={basePath} pathname={pathname} />
        ))}
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

export { roleNavItems, rolePath, tenantModeSections }
