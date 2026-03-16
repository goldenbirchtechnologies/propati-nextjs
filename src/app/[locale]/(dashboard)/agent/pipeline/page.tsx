import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'fully_signed':
      return { label: 'Closed', className: 'bg-green-50 text-green-700', icon: CheckCircle2 }
    case 'draft':
      return { label: 'Draft', className: 'bg-gray-100 text-gray-600', icon: FileText }
    case 'terminated':
    case 'expired':
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        className: 'bg-red-50 text-red-700',
        icon: AlertCircle,
      }
    case 'pending_landlord':
    case 'pending_tenant':
    case 'tenant_signed':
    case 'landlord_signed':
    default:
      return { label: 'In Progress', className: 'bg-yellow-50 text-yellow-700', icon: Clock }
  }
}

export default async function AgentPipeline({
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

  const agreements = await prisma.agreement.findMany({
    where: { agentId: dbUser.id },
    include: {
      listing: { select: { title: true, area: true } },
      landlord: { select: { fullName: true } },
      tenant: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const draftsCount = agreements.filter((a) => a.status === 'draft').length
  const inProgressCount = agreements.filter((a) =>
    ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(
      a.status ?? ''
    )
  ).length
  const closedCount = agreements.filter((a) => a.status === 'fully_signed').length

  const summaryCards = [
    {
      label: 'Drafts',
      value: draftsCount,
      className: 'bg-gray-50 border-gray-200',
      valueClass: 'text-gray-700',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      className: 'bg-yellow-50 border-yellow-200',
      valueClass: 'text-yellow-700',
    },
    {
      label: 'Closed',
      value: closedCount,
      className: 'bg-green-50 border-green-200',
      valueClass: 'text-green-700',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deal Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          {agreements.length} agreement{agreements.length !== 1 ? 's' : ''} managed
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-4 ${card.className}`}
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className={`mt-1 text-3xl font-bold ${card.valueClass}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Agreement list */}
      {agreements.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No deals yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Agreements assigned to you as agent will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {agreements.map((agr) => {
            const badge = statusBadge(agr.status ?? 'draft')
            const BadgeIcon = badge.icon
            return (
              <div
                key={agr.id}
                className="flex items-center gap-4 rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-rust/10">
                  <FileText className="h-5 w-5 text-rust" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{agr.listing.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {agr.landlord.fullName}
                    <span className="mx-1.5 text-muted-foreground/50">→</span>
                    {agr.tenant.fullName}
                  </p>
                </div>
                <div className="text-right">
                  {agr.rentAmount && (
                    <p className="text-sm font-medium">
                      ₦{Number(agr.rentAmount).toLocaleString()}
                      {agr.rentPeriod && (
                        <span className="text-xs text-muted-foreground">/{agr.rentPeriod}</span>
                      )}
                    </p>
                  )}
                  <span
                    className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    <BadgeIcon className="h-3 w-3" />
                    {badge.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
