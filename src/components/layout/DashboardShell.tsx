'use client'

import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import TenantModeProvider from '@/components/providers/TenantModeProvider'
import { useState } from 'react'

interface DashboardShellProps {
  children: React.ReactNode
  role: string
  fullName: string
  avatarUrl: string | null
  email: string
  locale: string
}

export default function DashboardShell({
  children,
  role,
  fullName,
  avatarUrl,
  email,
  locale,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const shell = (
    <div className="flex h-screen overflow-hidden bg-[#f5f3ee]">
      {/* Desktop sidebar */}
      <Sidebar role={role} locale={locale} />

      {/* Mobile nav */}
      <MobileNav
        role={role}
        locale={locale}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          fullName={fullName}
          avatarUrl={avatarUrl}
          email={email}
          locale={locale}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )

  // Wrap tenant in mode provider so sidebar + dashboard can share mode state
  if (role === 'tenant') {
    return <TenantModeProvider>{shell}</TenantModeProvider>
  }

  return shell
}
