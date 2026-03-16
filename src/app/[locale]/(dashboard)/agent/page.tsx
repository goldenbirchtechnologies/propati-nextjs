import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Building2, DollarSign, FileText, Shield, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function AgentDashboard({
  params,
}: {
  params: { locale: string }
}) {
  const clerkUserId = await getAuthUserId()
  if (!clerkUserId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      fullName: true,
      agentTier: true,
      agentApproved: true,
    },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const prefix = `/${params.locale}/agent`

  const [
    totalManagedListings,
    activeManagedListings,
    commissionData,
    pipelineCount,
  ] = await Promise.all([
    prisma.listing.count({ where: { agentId: dbUser.id } }),
    prisma.listing.count({ where: { agentId: dbUser.id, status: 'active' } }),
    prisma.transaction.aggregate({
      where: {
        agentId: dbUser.id,
        status: 'released',
      },
      _sum: { agentCommission: true },
    }),
    prisma.agreement.count({
      where: {
        agentId: dbUser.id,
        status: {
          in: ['draft', 'pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'],
        },
      },
    }),
  ])

  const totalCommission = Number(commissionData._sum.agentCommission ?? 0)
  const tierLabel = dbUser.agentTier
    ? dbUser.agentTier.charAt(0).toUpperCase() + dbUser.agentTier.slice(1)
    : 'Standard'

  const kpis = [
    {
      label: 'Managed Listings',
      value: totalManagedListings,
      sub: `${activeManagedListings} active`,
      icon: Building2,
      href: `${prefix}/listings`,
    },
    {
      label: 'Commissions Earned',
      value: `₦${totalCommission.toLocaleString()}`,
      sub: 'total released',
      icon: DollarSign,
      href: `${prefix}/commissions`,
    },
    {
      label: 'Deal Pipeline',
      value: pipelineCount,
      sub: 'active deals',
      icon: FileText,
      href: `${prefix}/pipeline`,
    },
    {
      label: 'Agent Tier',
      value: tierLabel,
      sub: dbUser.agentApproved ? 'Approved' : 'Pending approval',
      icon: Shield,
      href: `${prefix}/profile`,
    },
  ]

  const recentListings = await prisma.listing.findMany({
    where: { agentId: dbUser.id },
    include: {
      images: { orderBy: { isCover: 'desc' }, take: 1 },
      owner: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {dbUser.fullName?.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Approval warning */}
      {!dbUser.agentApproved && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">Account Pending Approval</p>
            <p className="mt-0.5 text-sm text-yellow-700">
              Your agent account is under review. Some features may be limited until approval is
              granted.
            </p>
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
                <div className="rounded-lg bg-rust/10 p-2">
                  <Icon className="h-5 w-5 text-rust" />
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

      {/* Recent Managed Listings */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Recent Managed Listings</h2>
          <Link href={`${prefix}/listings`} className="text-sm text-rust hover:underline">
            View all
          </Link>
        </div>

        {recentListings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2">No managed listings yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentListings.map((listing) => {
              const owner = listing.owner
              return (
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
                    <p className="text-xs text-muted-foreground">
                      Owner: {owner?.fullName ?? 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        listing.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {listing.status}
                    </span>
                    <Link
                      href={`/${params.locale}/listings/${listing.id}`}
                      className="text-xs text-rust hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
