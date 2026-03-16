'use client'

import Link from 'next/link'
import { useTenantMode, type TenantMode } from '@/components/providers/TenantModeProvider'
import {
  Home as HomeIcon, CreditCard, CheckCircle2, AlertCircle,
  Search, MessageSquare, FileText, User, Receipt,
} from 'lucide-react'

interface TenantDashboardClientProps {
  fullName: string
  profileCompleted: boolean
  missingFields: string[]
  prefix: string
  locale: string
  stats: {
    activeAgreements: number
    pendingAgreements: number
    unreadMessages: number
    openTickets: number
    overdueRent: number
  }
  currentHome: { title: string; area: string } | null
  nextPayment: { amount: number; dueDate: string; listing: string } | null
}

const MODE_CONFIG: Record<TenantMode, {
  label: string
  emoji: string
  welcomeText: string
  color: string
}> = {
  rent: {
    label: 'Rent a Home',
    emoji: '\uD83C\uDFE0',
    welcomeText: 'to rent a home',
    color: 'bg-teal',
  },
  buy: {
    label: 'Buy Property',
    emoji: '\uD83C\uDFE1',
    welcomeText: 'to buy property',
    color: 'bg-emerald-600',
  },
  shortlet: {
    label: 'Short Stay',
    emoji: '\uD83C\uDF34',
    welcomeText: 'to short stay',
    color: 'bg-teal',
  },
  share: {
    label: 'Find a Roommate',
    emoji: '\uD83E\uDD1D',
    welcomeText: 'to find a roommate',
    color: 'bg-teal',
  },
}

const TABS: { mode: TenantMode; emoji: string; label: string }[] = [
  { mode: 'rent', emoji: '\uD83C\uDFE0', label: 'Rent a Home' },
  { mode: 'buy', emoji: '\uD83C\uDFE1', label: 'Buy Property' },
  { mode: 'shortlet', emoji: '\uD83C\uDF34', label: 'Short Stay' },
  { mode: 'share', emoji: '\uD83E\uDD1D', label: 'Find a Roommate' },
]

export default function TenantDashboardClient({
  fullName,
  profileCompleted,
  missingFields,
  prefix,
  locale,
  stats,
  currentHome,
  nextPayment,
}: TenantDashboardClientProps) {
  const { mode, setMode } = useTenantMode()
  const config = MODE_CONFIG[mode]
  const firstName = fullName?.split(' ')[0] ?? 'there'

  const today = new Date()
  const dayName = today.toLocaleDateString('en-NG', { weekday: 'long' })
  const dayNum = today.getDate()
  const monthName = today.toLocaleDateString('en-NG', { month: 'long' })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {dayName.slice(0, 3)}, {dayNum} {monthName.slice(0, 3)}
          </p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="grid grid-cols-4 gap-0 rounded-xl border bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            onClick={() => setMode(tab.mode)}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
              mode === tab.mode
                ? 'border-2 border-teal bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile completion banner */}
      {!profileCompleted && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">Complete your profile to get approved faster</p>
              <p className="text-sm text-amber-700">
                Add {missingFields.length > 0 ? missingFields.join(', ') : 'missing details'}
              </p>
            </div>
          </div>
          <Link
            href={`${prefix}/profile`}
            className="whitespace-nowrap rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Complete &rarr;
          </Link>
        </div>
      )}

      {/* Welcome banner */}
      <div className={`rounded-xl ${config.color} px-6 py-5 text-white`}>
        <h2 className="text-xl font-bold">
          Welcome back, {firstName}! {config.emoji}
        </h2>
        <p className="mt-0.5 text-sm text-white/80">
          You&apos;re set up {config.welcomeText} &middot; {dayName}, {dayNum} {monthName}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Current Home */}
        <div className="rounded-xl border bg-white p-5 text-center">
          <div className="mx-auto mb-2 text-3xl">{'\uD83C\uDFE0'}</div>
          {currentHome ? (
            <>
              <p className="font-bold">{currentHome.title}</p>
              <p className="text-xs text-muted-foreground">{currentHome.area}</p>
            </>
          ) : (
            <>
              <p className="font-bold text-muted-foreground">&mdash;</p>
              <p className="text-xs text-muted-foreground">Current Home</p>
            </>
          )}
        </div>

        {/* Next Payment */}
        <div className="rounded-xl border bg-white p-5 text-center">
          <div className="mx-auto mb-2 flex justify-center">
            <CreditCard className="h-8 w-8 text-blue-500" />
          </div>
          {nextPayment ? (
            <>
              <p className="font-bold">{'\u20A6'}{nextPayment.amount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                Due {new Date(nextPayment.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-muted-foreground">&mdash;</p>
              <p className="text-xs text-muted-foreground">Next Payment</p>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="rounded-xl border bg-white p-5 text-center">
          <div className="mx-auto mb-2 flex justify-center">
            {profileCompleted ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-amber-500" />
            )}
          </div>
          <p className="font-bold">{profileCompleted ? 'Complete' : 'Incomplete'}</p>
          <p className="text-xs text-muted-foreground">Profile</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-semibold">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/`}
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Search className="h-4 w-4 text-teal" />
            Browse
          </Link>
          <Link
            href={`${prefix}/messages`}
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Messages
            {stats.unreadMessages > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {stats.unreadMessages}
              </span>
            )}
          </Link>
          <Link
            href={`${prefix}/agreements`}
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <FileText className="h-4 w-4 text-purple-500" />
            Agreements
          </Link>
          <Link
            href={`${prefix}/payments`}
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <CreditCard className="h-4 w-4 text-green-500" />
            Payments
          </Link>
          <Link
            href={`${prefix}/profile`}
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <User className="h-4 w-4 text-gold" />
            My Profile
          </Link>
          <Link
            href={`${prefix}/receipts`}
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Receipt className="h-4 w-4 text-gray-500" />
            Receipts
          </Link>
        </div>
      </div>
    </div>
  )
}
