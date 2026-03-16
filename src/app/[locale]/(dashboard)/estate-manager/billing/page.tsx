import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CreditCard, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react'
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

function subscriptionStatusStyle(status: string | null) {
  switch (status) {
    case 'active':
      return { badge: 'bg-green-100 text-green-700', icon: CheckCircle2, iconColor: 'text-green-600' }
    case 'cancelled':
      return { badge: 'bg-red-100 text-red-700', icon: AlertTriangle, iconColor: 'text-red-600' }
    case 'past_due':
      return { badge: 'bg-orange-100 text-orange-700', icon: AlertTriangle, iconColor: 'text-orange-600' }
    default:
      return { badge: 'bg-gray-100 text-gray-600', icon: CreditCard, iconColor: 'text-gray-500' }
  }
}

export default async function EMBilling({
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
    include: {
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
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

  const subscription = org.subscriptions[0] ?? null
  const { badge, icon: StatusIcon, iconColor } = subscriptionStatusStyle(
    subscription?.status ?? null,
  )

  const formatDate = (date: Date | null | undefined) =>
    date
      ? new Date(date).toLocaleDateString('en-NG', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'N/A'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing &amp; Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your plan for {org.name}</p>
      </div>

      {subscription ? (
        <>
          {/* Current plan card */}
          <div className="rounded-xl border bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2">
                  <StatusIcon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Plan</p>
                  <p className="text-xl font-bold capitalize">{subscription.plan}</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${badge}`}>
                {subscription.status ?? 'unknown'}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Amount</p>
                <p className="mt-0.5 font-semibold">
                  {subscription.amount != null
                    ? `₦${Number(subscription.amount).toLocaleString()}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Period Start</p>
                <p className="mt-0.5 font-semibold">
                  {formatDate(subscription.currentPeriodStart)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Period End</p>
                <p className="mt-0.5 font-semibold">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Billing Date</p>
                <p className="mt-0.5 font-semibold">
                  {formatDate(subscription.nextBillingDate)}
                </p>
              </div>
            </div>

            {subscription.cancelled_at && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                Subscription cancelled on {formatDate(subscription.cancelled_at)}.
              </div>
            )}
          </div>

          {/* Plan limits */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 font-semibold">Plan Limits</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Plan Tier</p>
                <p className="mt-0.5 font-semibold capitalize">{org.planTier ?? 'Starter'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Units</p>
                <p className="mt-0.5 font-semibold">{org.maxUnits ?? 20}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Seats</p>
                <p className="mt-0.5 font-semibold">{org.maxSeats ?? 1}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* No subscription — upgrade prompt */
        <div className="rounded-xl border bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <CreditCard className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold">No Active Subscription</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upgrade to a paid plan to unlock more units, team seats, and premium features.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { name: 'Starter', price: '₦15,000', units: 20, seats: 1 },
              { name: 'Growth', price: '₦35,000', units: 100, seats: 5 },
              { name: 'Enterprise', price: 'Custom', units: 'Unlimited', seats: 'Unlimited' },
            ].map((plan) => (
              <div
                key={plan.name}
                className="rounded-xl border p-4 text-left hover:border-blue-300 hover:bg-blue-50/30"
              >
                <p className="font-semibold">{plan.name}</p>
                <p className="mt-0.5 text-lg font-bold text-blue-600">{plan.price}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Up to {plan.units} units &middot; {plan.seats} seat{plan.seats !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
          <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            Upgrade Now
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Billing email note */}
      <p className="text-xs text-muted-foreground">
        Billing contact: <span className="font-medium">{org.billingEmail}</span>
      </p>
    </div>
  )
}
