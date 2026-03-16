import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  Users,
  Building2,
  CreditCard,
  FileText,
  AlertTriangle,
  Shield,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

function formatCurrency(val: number) {
  return `₦${val.toLocaleString()}`
}

export default async function AdminDashboard({
  params,
}: {
  params: { locale: string }
}) {
  const clerkUserId = await getAuthUserId()
  if (!clerkUserId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, fullName: true, role: true },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)
  if (dbUser.role !== 'admin') redirect(`/${params.locale}/${dbUser.role === 'estate_manager' ? 'estate-manager' : dbUser.role}`)

  const prefix = `/${params.locale}/admin`

  const [
    totalUsers,
    landlordCount,
    tenantCount,
    agentCount,
    estateManagerCount,
    adminCount,
    activeListings,
    totalListings,
    transactionStats,
    totalAgreements,
    openDisputes,
    pendingVerifications,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'landlord' } }),
    prisma.user.count({ where: { role: 'tenant' } }),
    prisma.user.count({ where: { role: 'agent' } }),
    prisma.user.count({ where: { role: 'estate_manager' } }),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.listing.count({ where: { status: 'active' } }),
    prisma.listing.count(),
    prisma.transaction.aggregate({
      where: { status: 'released' },
      _count: true,
      _sum: { platformFee: true },
    }),
    prisma.agreement.count(),
    prisma.disputes.count({ where: { status: 'open' } }),
    prisma.verification.count({ where: { overallStatus: 'in_progress' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ])

  const totalRevenue = Number(transactionStats._sum.platformFee ?? 0)
  const releasedTxCount = transactionStats._count

  const kpis = [
    {
      label: 'Total Users',
      value: totalUsers.toLocaleString(),
      sub: `${landlordCount}L · ${tenantCount}T · ${agentCount}A`,
      icon: Users,
      href: `${prefix}/users`,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Active Listings',
      value: activeListings.toLocaleString(),
      sub: `${totalListings} total`,
      icon: Building2,
      href: `${prefix}/verification`,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Platform Revenue',
      value: formatCurrency(totalRevenue),
      sub: `${releasedTxCount} released txns`,
      icon: CreditCard,
      href: `${prefix}/revenue`,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Agreements',
      value: totalAgreements.toLocaleString(),
      sub: 'all time',
      icon: FileText,
      href: `${prefix}/disputes`,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Open Disputes',
      value: openDisputes.toLocaleString(),
      sub: 'need attention',
      icon: AlertTriangle,
      href: `${prefix}/disputes`,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Pending Verifications',
      value: pendingVerifications.toLocaleString(),
      sub: 'in progress',
      icon: Shield,
      href: `${prefix}/verification`,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  const roleBadge: Record<string, string> = {
    landlord: 'bg-yellow-50 text-yellow-800',
    tenant: 'bg-teal-50 text-teal-800',
    agent: 'bg-orange-50 text-orange-800',
    admin: 'bg-red-50 text-red-700',
    estate_manager: 'bg-blue-50 text-blue-800',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Console</h1>
        <p className="text-sm text-muted-foreground">Platform-wide overview</p>
      </div>

      {/* Role breakdown chips */}
      <div className="flex flex-wrap gap-2 text-sm">
        {[
          { label: 'Landlords', count: landlordCount, cls: 'bg-yellow-50 text-yellow-800' },
          { label: 'Tenants', count: tenantCount, cls: 'bg-teal-50 text-teal-800' },
          { label: 'Agents', count: agentCount, cls: 'bg-orange-50 text-orange-800' },
          { label: 'Estate Managers', count: estateManagerCount, cls: 'bg-blue-50 text-blue-800' },
          { label: 'Admins', count: adminCount, cls: 'bg-red-50 text-red-700' },
        ].map((r) => (
          <span key={r.label} className={`rounded-full px-3 py-1 text-xs font-medium ${r.cls}`}>
            {r.label}: {r.count}
          </span>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <a
              key={kpi.label}
              href={kpi.href}
              className="rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className={`mb-3 inline-flex rounded-lg p-2 ${kpi.bg}`}>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </a>
          )
        })}
      </div>

      {/* Recent Users */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Recent Registrations</h2>
          <a href={`${prefix}/users`} className="text-sm text-red-600 hover:underline">
            View all users
          </a>
        </div>
        {recentUsers.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">No users yet</p>
        ) : (
          <div className="divide-y">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-4 p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-600">
                  {u.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{u.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[u.role] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {u.role}
                </span>
                <p className="whitespace-nowrap text-xs text-muted-foreground">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
