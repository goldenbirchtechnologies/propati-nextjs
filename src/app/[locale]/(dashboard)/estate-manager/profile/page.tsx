import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  CreditCard,
  Users,
  MapPin,
  FileText,
} from 'lucide-react'
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

export default async function EMProfile({
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
      email: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const org = await prisma.organisation.findFirst({
    where: { ownerId: dbUser.id },
    include: {
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { listings: true, members: true } },
    },
  })

  const prefix = `/${params.locale}/estate-manager`

  const joinDate = dbUser.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  if (!org) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Building2 className="h-10 w-10 text-blue-600" />
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

  const subscription = org.subscriptions[0]
  const planLabel = org.planTier
    ? org.planTier.charAt(0).toUpperCase() + org.planTier.slice(1)
    : 'Free'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account and organisation details</p>
      </div>

      {/* Personal info card */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold">Personal Information</h3>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {dbUser.avatarUrl ? (
            <img
              src={dbUser.avatarUrl}
              alt={dbUser.fullName}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold">{dbUser.fullName}</h2>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              <Building2 className="h-3 w-3" />
              Estate Manager
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{dbUser.email}</p>
            </div>
          </div>

          {dbUser.phone && (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Phone className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{dbUser.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium">{joinDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Organisation card */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold">Organisation</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{org.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Billing Email</p>
              <p className="text-sm font-medium">{org.billingEmail}</p>
            </div>
          </div>

          {org.address && (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{org.address}</p>
              </div>
            </div>
          )}

          {org.cacNumber && (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CAC Number</p>
                <p className="text-sm font-medium">{org.cacNumber}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Portfolio Units</p>
              <p className="text-sm font-medium">
                {org._count.listings} / {org.maxUnits ?? 20}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Team Seats</p>
              <p className="text-sm font-medium">
                {org._count.members} / {org.maxSeats ?? 1}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="text-sm font-medium">
                {planLabel}
                {subscription && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({subscription.status === 'active' ? 'Active' : subscription.status ?? 'N/A'})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link
            href={`${prefix}/billing`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Manage Billing &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
