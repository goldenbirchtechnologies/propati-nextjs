import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FileText, CreditCard, MessageSquare, Wrench, Search, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function TenantDashboard({
  params,
}: {
  params: { locale: string }
}) {
  const clerkUserId = await getAuthUserId()
  if (!clerkUserId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, fullName: true, profileCompleted: true },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const prefix = `/${params.locale}/tenant`

  const [
    activeAgreements,
    pendingAgreements,
    unreadMessages,
    openTickets,
    upcomingRent,
    overdueRent,
  ] = await Promise.all([
    prisma.agreement.count({ where: { tenantId: dbUser.id, status: 'fully_signed' } }),
    prisma.agreement.count({
      where: { tenantId: dbUser.id, status: { in: ['draft', 'pending_tenant', 'pending_landlord'] } },
    }),
    prisma.conversation.aggregate({
      where: { tenantId: dbUser.id },
      _sum: { unreadTenant: true },
    }),
    prisma.maintenanceTicket.count({
      where: { tenantId: dbUser.id, status: { in: ['open', 'assigned', 'in_progress'] } },
    }),
    prisma.rentSchedule.findMany({
      where: {
        agreement: { tenantId: dbUser.id },
        status: 'upcoming',
      },
      include: {
        agreement: {
          select: { listing: { select: { title: true } } },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 3,
    }),
    prisma.rentSchedule.count({
      where: {
        agreement: { tenantId: dbUser.id },
        status: 'overdue',
      },
    }),
  ])

  const unread = unreadMessages._sum.unreadTenant ?? 0

  const kpis = [
    {
      label: 'Agreements',
      value: activeAgreements,
      sub: pendingAgreements > 0 ? `${pendingAgreements} pending` : 'All signed',
      icon: FileText,
      href: `${prefix}/agreements`,
      color: 'text-teal',
      bg: 'bg-teal/10',
    },
    {
      label: 'Messages',
      value: unread,
      sub: 'unread',
      icon: MessageSquare,
      href: `${prefix}/messages`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Maintenance',
      value: openTickets,
      sub: 'open tickets',
      icon: Wrench,
      href: `${prefix}/maintenance`,
      color: 'text-rust',
      bg: 'bg-rust/10',
    },
    {
      label: 'Overdue Rent',
      value: overdueRent,
      sub: overdueRent > 0 ? 'Action needed' : 'All clear',
      icon: AlertTriangle,
      href: `${prefix}/payments`,
      color: overdueRent > 0 ? 'text-red-600' : 'text-green-600',
      bg: overdueRent > 0 ? 'bg-red-50' : 'bg-green-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Home</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {dbUser.fullName?.split(' ')[0]}
          </p>
        </div>
        <Link
          href={`${prefix}/search`}
          className="flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal/90"
        >
          <Search className="h-4 w-4" />
          Find Property
        </Link>
      </div>

      {/* Profile completion banner */}
      {!dbUser.profileCompleted && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-yellow-800">Complete your profile</p>
              <p className="text-sm text-yellow-700">
                A complete profile improves your chances with landlords
              </p>
            </div>
            <Link
              href={`${prefix}/profile`}
              className="rounded-lg bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-700"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${kpi.bg}`}>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Upcoming rent */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Upcoming Rent</h2>
          <Link href={`${prefix}/payments`} className="text-sm text-teal hover:underline">
            View all
          </Link>
        </div>
        {upcomingRent.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2">No upcoming rent payments</p>
          </div>
        ) : (
          <div className="divide-y">
            {upcomingRent.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{schedule.agreement.listing.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {new Date(schedule.dueDate).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <p className="text-lg font-bold text-teal">₦{Number(schedule.amount).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
