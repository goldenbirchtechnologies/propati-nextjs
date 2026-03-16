import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  Building2,
  Users,
  Wrench,
  UserCheck,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function EstateManagerDashboard({
  params,
}: {
  params: { locale: string }
}) {
  const clerkUserId = await getAuthUserId()
  if (!clerkUserId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, fullName: true },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const org = await prisma.organisation.findFirst({
    where: { ownerId: dbUser.id },
    include: {
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  const prefix = `/${params.locale}/estate-manager`

  if (!org) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-blue-50 p-4">
          <Building2 className="h-10 w-10 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold">No Organisation Yet</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Create an organisation to manage your property portfolio, team, and tenants in one place.
        </p>
        <Link
          href={`${prefix}/create-org`}
          className="mt-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Organisation
        </Link>
      </div>
    )
  }

  // Fetch all KPIs in parallel
  const listingIds = await prisma.orgListing.findMany({
    where: { orgId: org.id },
    select: { listingId: true },
  })
  const ids = listingIds.map((l) => l.listingId)

  const [totalUnits, activeTenants, openTickets, teamMembers] = await Promise.all([
    // Total units = count of org listings
    prisma.orgListing.count({ where: { orgId: org.id } }),
    // Active tenants = agreements with status fully_signed for org listings
    ids.length > 0
      ? prisma.agreement.count({
          where: { listingId: { in: ids }, status: 'fully_signed' },
        })
      : Promise.resolve(0),
    // Open maintenance tickets for the org
    prisma.maintenanceTicket.count({
      where: { orgId: org.id, status: { in: ['open', 'in_progress'] } },
    }),
    // Team members (all statuses)
    prisma.orgMember.count({ where: { orgId: org.id } }),
  ])

  const subscription = org.subscriptions[0]

  const kpis = [
    {
      label: 'Total Units',
      value: totalUnits,
      sub: 'in your portfolio',
      icon: Building2,
      href: `${prefix}/portfolio`,
    },
    {
      label: 'Active Tenants',
      value: activeTenants,
      sub: 'fully signed agreements',
      icon: UserCheck,
      href: `${prefix}/rent`,
    },
    {
      label: 'Open Tickets',
      value: openTickets,
      sub: 'maintenance requests',
      icon: Wrench,
      href: `${prefix}/maintenance`,
    },
    {
      label: 'Team Members',
      value: teamMembers,
      sub: 'in organisation',
      icon: Users,
      href: `${prefix}/team`,
    },
    {
      label: 'Subscription',
      value: subscription ? org.planTier ?? subscription.plan : 'Free',
      sub: subscription
        ? subscription.status === 'active'
          ? 'Active'
          : subscription.status ?? 'No plan'
        : 'Upgrade for more',
      icon: CreditCard,
      href: `${prefix}/billing`,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estate Manager</h1>
          <p className="text-sm text-muted-foreground">
            {org.name} &mdash; Welcome back, {dbUser.fullName?.split(' ')[0]}
          </p>
        </div>
        <Link
          href={`${prefix}/portfolio`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View Portfolio
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold capitalize">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick links */}
      <div className="rounded-xl border bg-white">
        <div className="border-b p-4">
          <h2 className="font-semibold">Quick Actions</h2>
        </div>
        <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <Link
            href={`${prefix}/maintenance`}
            className="flex items-center gap-3 p-4 hover:bg-muted/30"
          >
            <Wrench className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Maintenance Tickets</p>
              <p className="text-xs text-muted-foreground">
                {openTickets} open ticket{openTickets !== 1 ? 's' : ''}
              </p>
            </div>
          </Link>
          <Link
            href={`${prefix}/team`}
            className="flex items-center gap-3 p-4 hover:bg-muted/30"
          >
            <Users className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Team Management</p>
              <p className="text-xs text-muted-foreground">
                {teamMembers} member{teamMembers !== 1 ? 's' : ''}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
