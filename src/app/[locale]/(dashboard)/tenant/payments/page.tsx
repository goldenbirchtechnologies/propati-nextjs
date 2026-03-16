import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CreditCard, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { PayRentButton } from '@/components/payments/PayRentButton'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function TenantPayments({
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

  const rentSchedules = await prisma.rentSchedule.findMany({
    where: {
      agreement: { tenantId: dbUser.id },
    },
    include: {
      agreement: {
        select: {
          listing: { select: { title: true } },
          landlord: { select: { fullName: true } },
        },
      },
    },
    orderBy: { dueDate: 'desc' },
  })

  const paid = rentSchedules.filter((r) => r.status === 'paid')
  const overdue = rentSchedules.filter((r) => r.status === 'overdue')
  const upcoming = rentSchedules.filter((r) => r.status === 'upcoming')

  const totalPaid = paid.reduce((sum, r) => sum + Number(r.amount), 0)
  const totalOverdue = overdue.reduce((sum, r) => sum + Number(r.amount), 0)
  const totalUpcoming = upcoming.reduce((sum, r) => sum + Number(r.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rent & Payments</h1>
        <p className="text-sm text-muted-foreground">Track your rent payments and history</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{paid.length} payment{paid.length !== 1 ? 's' : ''}</p>
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
              <p className="text-xl font-bold text-red-600">₦{totalOverdue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{overdue.length} payment{overdue.length !== 1 ? 's' : ''}</p>
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
              <p className="text-xl font-bold text-blue-600">₦{totalUpcoming.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{upcoming.length} payment{upcoming.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment list */}
      {rentSchedules.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No payments yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Payment schedules will appear here once you have active agreements
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold">Payment History</h2>
          </div>
          <div className="divide-y">
            {rentSchedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center gap-4 p-4">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                  schedule.status === 'paid' ? 'bg-green-50' :
                  schedule.status === 'overdue' ? 'bg-red-50' : 'bg-blue-50'
                }`}>
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
                    To: {schedule.agreement.landlord.fullName} &middot; Due {new Date(schedule.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-medium">₦{Number(schedule.amount).toLocaleString()}</p>
                  {schedule.status === 'paid' ? (
                    <span className="text-xs font-medium text-green-600">Paid</span>
                  ) : (
                    <PayRentButton rentScheduleId={schedule.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
