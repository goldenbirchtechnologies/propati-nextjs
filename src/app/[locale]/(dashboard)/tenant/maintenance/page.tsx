import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Wrench, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function TenantMaintenance({
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

  const tickets = await prisma.maintenanceTicket.findMany({
    where: { tenantId: dbUser.id },
    include: {
      listings: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  function statusInfo(status: string) {
    switch (status) {
      case 'open':
        return { label: 'Open', className: 'bg-yellow-50 text-yellow-700', icon: AlertTriangle }
      case 'assigned':
      case 'in_progress':
        return { label: 'In Progress', className: 'bg-blue-50 text-blue-700', icon: Clock }
      case 'resolved':
      case 'closed':
        return { label: 'Resolved', className: 'bg-green-50 text-green-700', icon: CheckCircle2 }
      default:
        return { label: status, className: 'bg-gray-100 text-gray-600', icon: Clock }
    }
  }

  function priorityColor(priority: string) {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Maintenance Requests</h1>
        <p className="text-sm text-muted-foreground">Track your maintenance and repair requests</p>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No maintenance requests</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit a maintenance request if you need repairs in your property
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const badge = statusInfo(ticket.status ?? 'open')
            const BadgeIcon = badge.icon
            return (
              <div key={ticket.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-rust/10">
                    <Wrench className="h-5 w-5 text-rust" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.listings?.title ?? 'Property'} &middot;{' '}
                      <span className={`font-medium capitalize ${priorityColor(ticket.priority ?? 'medium')}`}>
                        {ticket.priority}
                      </span>
                      {' '}&middot; {ticket.category}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                    <BadgeIcon className="h-3 w-3" />
                    {badge.label}
                  </span>
                </div>
                {ticket.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Submitted {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-NG', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  }) : 'N/A'}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
