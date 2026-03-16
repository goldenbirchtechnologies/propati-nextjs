import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function LandlordAgreements({
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
    where: { landlordId: dbUser.id },
    include: {
      listing: { select: { title: true, address: true, area: true } },
      tenant: { select: { fullName: true, email: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  function statusBadge(status: string) {
    switch (status) {
      case 'fully_signed':
        return { label: 'Active', className: 'bg-green-50 text-green-700', icon: CheckCircle2 }
      case 'draft':
        return { label: 'Draft', className: 'bg-gray-100 text-gray-600', icon: FileText }
      case 'pending_landlord':
      case 'pending_tenant':
      case 'tenant_signed':
      case 'landlord_signed':
        return { label: 'Pending', className: 'bg-yellow-50 text-yellow-700', icon: Clock }
      case 'terminated':
      case 'expired':
        return { label: status.charAt(0).toUpperCase() + status.slice(1), className: 'bg-red-50 text-red-700', icon: AlertCircle }
      default:
        return { label: status, className: 'bg-gray-100 text-gray-600', icon: FileText }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agreements</h1>
        <p className="text-sm text-muted-foreground">{agreements.length} agreement{agreements.length !== 1 ? 's' : ''}</p>
      </div>

      {agreements.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No agreements yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Agreements will appear here when tenants apply to your properties
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
                  <p className="text-xs text-muted-foreground">
                    Tenant: {agr.tenant.fullName} &middot; {agr.type}
                  </p>
                </div>
                <div className="text-right">
                  {agr.rentAmount && (
                    <p className="text-sm font-medium">₦{Number(agr.rentAmount).toLocaleString()}/{agr.rentPeriod}</p>
                  )}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
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
