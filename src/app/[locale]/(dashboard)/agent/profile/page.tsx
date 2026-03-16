import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'

export const dynamic = 'force-dynamic'

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
      profileBio: true,
      agentBio: true,
      agentAreas: true,
      agentTier: true,
      agentApproved: true,
      ninVerified: true,
      idVerified: true,
      avatarUrl: true,
      createdAt: true,
      _count: { select: { agentListings: true } },
    },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const areas: string[] = Array.isArray(dbUser.agentAreas)
    ? (dbUser.agentAreas as unknown[]).filter((a): a is string => typeof a === 'string')
    : []

  const user = {
    fullName: dbUser.fullName,
    email: dbUser.email,
    phone: dbUser.phone,
    profileBio: dbUser.profileBio,
    employmentStatus: null,
    employmentType: null,
    employerName: null,
    jobTitle: null,
    yearlyIncome: null,
    guarantorName: null,
    guarantorPhone: null,
    guarantorRelationship: null,
    ninVerified: dbUser.ninVerified ?? false,
    idVerified: dbUser.idVerified ?? false,
    incomeVerified: null,
    profileCompleted: null,
    agentBio: dbUser.agentBio,
    agentAreas: areas,
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agent Profile</h1>
        <p className="text-sm text-muted-foreground">
          {dbUser.agentApproved ? 'Approved' : 'Pending approval'} · {dbUser.agentTier ?? 'Standard'} tier · {dbUser._count.agentListings} managed listings
        </p>
      </div>

      <ProfileEditForm user={user} role="agent" locale={params.locale} />
    </div>
  )
}
