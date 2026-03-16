import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Building2, Eye, FileText, MessageSquare, CreditCard, Shield } from 'lucide-react'
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

export default async function LandlordDashboard({
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

  const prefix = `/${params.locale}/landlord`

  // Fetch KPI data in parallel
  const [
    totalListings,
    activeListings,
    totalViews,
    totalAgreements,
    pendingAgreements,
    unreadMessages,
    rentSchedules,
  ] = await Promise.all([
    prisma.listing.count({ where: { ownerId: dbUser.id } }),
    prisma.listing.count({ where: { ownerId: dbUser.id, status: 'active' } }),
    prisma.listing.aggregate({
      where: { ownerId: dbUser.id },
      _sum: { viewsCount: true },
    }),
    prisma.agreement.count({ where: { landlordId: dbUser.id } }),
    prisma.agreement.count({
      where: { landlordId: dbUser.id, status: { in: ['draft', 'pending_landlord', 'pending_tenant'] } },
    }),
    prisma.conversation.aggregate({
      where: { landlordId: dbUser.id },
      _sum: { unreadLandlord: true },
    }),
    prisma.rentSchedule.findMany({
      where: {
        agreement: { landlordId: dbUser.id },
        status: { in: ['paid', 'overdue'] },
      },
      select: { amount: true, status: true },
    }),
  ])

  const rentCollected = rentSchedules
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + Number(r.amount), 0)

  const rentOverdue = rentSchedules
    .filter((r) => r.status === 'overdue')
    .reduce((sum, r) => sum + Number(r.amount), 0)

  const views = totalViews._sum.viewsCount ?? 0
  const unread = unreadMessages._sum.unreadLandlord ?? 0

  const kpis = [
    {
      label: 'Total Properties',
      value: totalListings,
      sub: `${activeListings} active`,
      icon: Building2,
      href: `${prefix}/listings`,
      color: 'text-gold',
      bg: 'bg-gold/10',
    },
    {
      label: 'Total Views',
      value: views.toLocaleString(),
      sub: 'across all listings',
      icon: Eye,
      href: `${prefix}/listings`,
      color: 'text-teal',
      bg: 'bg-teal/10',
    },
    {
      label: 'Rent Collected',
      value: `₦${rentCollected.toLocaleString()}`,
      sub: rentOverdue > 0 ? `₦${rentOverdue.toLocaleString()} overdue` : 'All up to date',
      icon: CreditCard,
      href: `${prefix}/rent`,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Agreements',
      value: totalAgreements,
      sub: `${pendingAgreements} pending`,
      icon: FileText,
      href: `${prefix}/agreements`,
      color: 'text-rust',
      bg: 'bg-rust/10',
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
  ]

  // Recent listings
  const recentListings = await prisma.listing.findMany({
    where: { ownerId: dbUser.id },
    include: {
      images: { orderBy: { isCover: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio Overview</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {dbUser.fullName?.split(' ')[0]}
          </p>
        </div>
        <Link
          href={`${prefix}/listings/new`}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold/90"
        >
          + Add Listing
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

      {/* Recent Listings */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Recent Listings</h2>
          <Link href={`${prefix}/listings`} className="text-sm text-gold hover:underline">
            View all
          </Link>
        </div>
        {recentListings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2">No listings yet</p>
            <Link
              href={`${prefix}/listings/new`}
              className="mt-3 inline-block text-sm text-gold hover:underline"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {recentListings.map((listing) => (
              <div key={listing.id} className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {listing.images[0] ? (
                    <img
                      src={listing.images[0].url}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{listing.title}</p>
                  <p className="text-xs text-muted-foreground">{listing.area}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    listing.status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : listing.status === 'draft'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {listing.status}
                </span>
                <p className="text-sm font-medium">
                  ₦{Number(listing.price).toLocaleString()}
                  {listing.pricePeriod && (
                    <span className="text-xs text-muted-foreground">/{listing.pricePeriod}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
