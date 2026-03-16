import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Wrench } from 'lucide-react'
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

function priorityStyle(priority: string | null) {
  switch (priority) {
    case 'urgent':
      return { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
    case 'high':
      return { badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' }
    case 'medium':
      return { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' }
    default:
      return { badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
  }
}

function statusStyle(status: string | null) {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-700'
    case 'in_progress':
      return 'bg-purple-100 text-purple-700'
    case 'resolved':
      return 'bg-green-100 text-green-700'
    case 'closed':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export default async function EMMaintenance({
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
        <Wrench className="h-10 w-10 text-blue-600" />
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

  const tickets = await prisma.maintenanceTicket.findMany({
    where: { orgId: org.id },
    include: {
      listings: { select: { title: true, area: true } },
      users_maintenance_tickets_assigned_toTousers: {
        select: { fullName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const openCount = tickets.filter((t) => t.status === 'open').length
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Maintenance Tickets</h1>
        <p className="text-sm text-muted-foreground">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} for {org.name}
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Open</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{openCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-purple-600">{inProgressCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Resolved / Closed</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{resolvedCount}</p>
        </div>
      </div>

      {/* Ticket list */}
      {tickets.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No maintenance tickets</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tickets raised by tenants on your properties will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold">All Tickets</h2>
          </div>
          <div className="divide-y">
            {tickets.map((ticket) => {
              const { badge: priorityBadge, dot: priorityDot } = priorityStyle(ticket.priority)
              const statusBadge = statusStyle(ticket.status)
              return (
                <div key={ticket.id} className="flex items-start gap-4 p-4">
                  <div className="mt-1.5 flex-shrink-0">
                    <span className={`block h-2.5 w-2.5 rounded-full ${priorityDot}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{ticket.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ticket.listings
                        ? `${ticket.listings.title} · ${ticket.listings.area}`
                        : 'No property linked'}
                    </p>
                    {ticket.category && (
                      <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                        Category: {ticket.category}
                      </p>
                    )}
                    {ticket.users_maintenance_tickets_assigned_toTousers && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Assigned to:{' '}
                        <span className="font-medium text-foreground">
                          {ticket.users_maintenance_tickets_assigned_toTousers.fullName}
                        </span>
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : ''}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityBadge}`}
                    >
                      {ticket.priority ?? 'low'}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge}`}
                    >
                      {ticket.status ?? 'open'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
