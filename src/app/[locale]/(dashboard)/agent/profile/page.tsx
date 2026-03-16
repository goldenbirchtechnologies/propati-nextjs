import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { User, Mail, Phone, Building2, Calendar, Shield, CheckCircle2, Clock } from 'lucide-react'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function AgentProfile({
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
      agentTier: true,
      agentApproved: true,
      agentBio: true,
      agentAreas: true,
      createdAt: true,
      _count: { select: { agentListings: true } },
    },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const tierLabel = dbUser.agentTier
    ? dbUser.agentTier.charAt(0).toUpperCase() + dbUser.agentTier.slice(1)
    : 'Standard'

  const joinDate = dbUser.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  // agentAreas is a JSON field — may be an array of strings
  const areas: string[] = Array.isArray(dbUser.agentAreas)
    ? (dbUser.agentAreas as unknown[]).filter((a): a is string => typeof a === 'string')
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">Your agent account details</p>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {dbUser.avatarUrl ? (
              <img
                src={dbUser.avatarUrl}
                alt={dbUser.fullName}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rust/10">
                <User className="h-8 w-8 text-rust" />
              </div>
            )}
          </div>

          {/* Name and badges */}
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold">{dbUser.fullName}</h2>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {/* Agent badge */}
              <span className="inline-flex items-center gap-1 rounded-full bg-rust/10 px-2.5 py-0.5 text-xs font-semibold text-rust">
                <Shield className="h-3 w-3" />
                Agent
              </span>
              {/* Approval badge */}
              {dbUser.agentApproved ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                  <Clock className="h-3 w-3" />
                  Pending Approval
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rust/10 p-2">
              <Mail className="h-4 w-4 text-rust" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{dbUser.email}</p>
            </div>
          </div>

          {dbUser.phone && (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rust/10 p-2">
                <Phone className="h-4 w-4 text-rust" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{dbUser.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rust/10 p-2">
              <Shield className="h-4 w-4 text-rust" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Agent Tier</p>
              <p className="text-sm font-medium">{tierLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rust/10 p-2">
              <Building2 className="h-4 w-4 text-rust" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Managed Listings</p>
              <p className="text-sm font-medium">{dbUser._count.agentListings}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rust/10 p-2">
              <Calendar className="h-4 w-4 text-rust" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium">{joinDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio section */}
      {dbUser.agentBio && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold">About Me</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{dbUser.agentBio}</p>
        </div>
      )}

      {/* Service Areas section */}
      {areas.length > 0 && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold">Service Areas</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {areas.map((area) => (
              <span
                key={area}
                className="rounded-full bg-rust/10 px-3 py-1 text-sm font-medium text-rust"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
