import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BarChart2, Building2, FileText, Wrench, CreditCard } from 'lucide-react'
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

export default async function EMReports({
  params,
}: {
  params: { locale: string }
}) {
  const clerkUserId = await getAuthUserId()
  if (!clerkUserId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const org = await prisma.organisation.findFirst({
    where: { ownerId: dbUser.id },
  })

  const prefix = `/${params.locale}/estate-manager`

  if (!org) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <BarChart2 className="h-10 w-10 text-blue-600" />
        <h1 className="text-2xl font-bold">No Organisation</h1>
        <p className="text-sm text-muted-foreground">Create an organisation first.</p>
        <Link
          href={`${prefix}/create-org`}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Organisation
        </Link>
      </div>
    )
  }

  // Current month bounds
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  const monthLabel = now.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })

  // Get listing IDs for the org
  const orgListings = await prisma.orgListing.findMany({
    where: { orgId: org.id },
    select: { listingId: true },
  })
  const listingIds = orgListings.map((l) => l.listingId)

  const [totalListings, totalAgreements, totalTickets, rentRevenue] = await Promise.all([
    // Total listings in org
    prisma.orgListing.count({ where: { orgId: org.id } }),
    // Agreements created this month for org listings
    listingIds.length > 0
      ? prisma.agreement.count({
          where: {
            listingId: { in: listingIds },
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        })
      : Promise.resolve(0),
    // Maintenance tickets opened this month
    prisma.maintenanceTicket.count({
      where: {
        orgId: org.id,
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    // Rent collected this month
    listingIds.length > 0
      ? prisma.rentSchedule.findMany({
          where: {
            agreement: { listingId: { in: listingIds } },
            status: 'paid',
            paidAt: { gte: monthStart, lte: monthEnd },
          },
          select: { amount: true },
        })
      : Promise.resolve([]),
  ])

  const revenueTotal = (rentRevenue as { amount: { toString: () => string } }[]).reduce(
    (sum, r) => sum + Number(r.amount),
    0,
  )

  const summaryCards = [
    {
      label: 'Total Units',
      value: totalListings,
      sub: 'in your portfolio',
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'New Agreements',
      value: totalAgreements,
      sub: `in ${monthLabel}`,
      icon: FileText,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Tickets Opened',
      value: totalTickets,
      sub: `in ${monthLabel}`,
      icon: Wrench,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Rent Collected',
      value: `₦${revenueTotal.toLocaleString()}`,
      sub: `in ${monthLabel}`,
      icon: CreditCard,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Monthly summary for {org.name} &mdash; {monthLabel}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Placeholder notice */}
      <div className="rounded-xl border border-dashed bg-white p-8 text-center">
        <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="mt-3 text-lg font-medium">Detailed Reports Coming Soon</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Full monthly PDF reports with charts, occupancy rates, and financial breakdowns will be
          available in a future update.
        </p>
      </div>
    </div>
  )
}
