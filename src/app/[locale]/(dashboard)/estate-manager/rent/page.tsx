import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CreditCard, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function EMRentLedger({
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
        <CreditCard className="h-10 w-10 text-blue-600" />
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

  // Get all listing IDs in the org
  const orgListings = await prisma.orgListing.findMany({
    where: { orgId: org.id },
    select: { listingId: true },
  })
  const listingIds = orgListings.map((l) => l.listingId)

  const rentSchedules =
    listingIds.length > 0
      ? await prisma.rentSchedule.findMany({
          where: {
            agreement: { listingId: { in: listingIds } },
          },
          include: {
            agreement: {
              select: {
                listing: { select: { title: true, address: true } },
                tenant: { select: { fullName: true } },
              },
            },
          },
          orderBy: { dueDate: 'desc' },
        })
      : []

  const paid = rentSchedules.filter((r) => r.status === 'paid')
  const overdue = rentSchedules.filter((r) => r.status === 'overdue')
  const upcoming = rentSchedules.filter((r) => r.status === 'upcoming')

  const totalCollected = paid.reduce((sum, r) => sum + Number(r.amount), 0)
  const totalOverdue = overdue.reduce((sum, r) => sum + Number(r.amount), 0)
  const totalUpcoming = upcoming.reduce((sum, r) => sum + Number(r.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rent Ledger</h1>
        <p className="text-sm text-muted-foreground">
          Track rent schedules for all properties in {org.name}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-xl font-bold text-green-600">
                ₦{totalCollected.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {paid.length} payment{paid.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-xl font-bold text-red-600">
                ₦{totalOverdue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {overdue.length} payment{overdue.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Upcoming</p>
              <p className="text-xl font-bold text-blue-600">
                ₦{totalUpcoming.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {upcoming.length} payment{upcoming.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule list */}
      {rentSchedules.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No rent schedules</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Rent schedules will appear once tenants have active agreements on your properties.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold">Payment Schedule</h2>
          </div>
          <div className="divide-y">
            {rentSchedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center gap-4 p-4">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                    schedule.status === 'paid'
                      ? 'bg-green-50'
                      : schedule.status === 'overdue'
                        ? 'bg-red-50'
                        : 'bg-blue-50'
                  }`}
                >
                  {schedule.status === 'paid' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : schedule.status === 'overdue' ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {schedule.agreement.listing.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {schedule.agreement.tenant.fullName} &middot; Due{' '}
                    {new Date(schedule.dueDate).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    ₦{Number(schedule.amount).toLocaleString()}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      schedule.status === 'paid'
                        ? 'text-green-600'
                        : schedule.status === 'overdue'
                          ? 'text-red-600'
                          : 'text-blue-600'
                    }`}
                  >
                    {schedule.status === 'paid'
                      ? 'Paid'
                      : schedule.status === 'overdue'
                        ? 'Overdue'
                        : 'Upcoming'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
