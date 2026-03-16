import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Phone, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function LandlordScreening({
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

  const screeningCalls = await prisma.screening_calls.findMany({
    where: { landlord_id: dbUser.id },
    include: {
      users_screening_calls_tenant_idTousers: {
        select: { fullName: true, avatarUrl: true, email: true },
      },
      listings: {
        select: { title: true },
      },
    },
    orderBy: { created_at: 'desc' },
  })

  function statusBadge(status: string) {
    switch (status) {
      case 'completed':
        return { label: 'Completed', className: 'bg-green-50 text-green-700', icon: CheckCircle2 }
      case 'scheduled':
        return { label: 'Scheduled', className: 'bg-blue-50 text-blue-700', icon: Calendar }
      case 'requested':
        return { label: 'Requested', className: 'bg-yellow-50 text-yellow-700', icon: Clock }
      case 'cancelled':
        return { label: 'Cancelled', className: 'bg-red-50 text-red-700', icon: XCircle }
      default:
        return { label: status ?? 'Pending', className: 'bg-gray-100 text-gray-600', icon: Clock }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Screening Calls</h1>
        <p className="text-sm text-muted-foreground">Review and schedule tenant screening calls</p>
      </div>

      {screeningCalls.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Phone className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No screening calls</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Screening requests will appear here when tenants apply to your properties
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {screeningCalls.map((call) => {
            const badge = statusBadge(call.status ?? 'requested')
            const BadgeIcon = badge.icon
            const tenant = call.users_screening_calls_tenant_idTousers
            return (
              <div
                key={call.id}
                className="flex items-center gap-4 rounded-xl border bg-white p-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal/10">
                  {tenant.avatarUrl ? (
                    <img src={tenant.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-teal">
                      {tenant.fullName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{tenant.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {call.listings?.title ?? 'Unknown property'}
                  </p>
                  {call.scheduled_at && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Scheduled: {new Date(call.scheduled_at).toLocaleDateString('en-NG', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                  <BadgeIcon className="h-3 w-3" />
                  {badge.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
