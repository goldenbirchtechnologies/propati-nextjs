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

export default async function TenantProfile({
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
      employmentStatus: true,
      employmentType: true,
      employerName: true,
      jobTitle: true,
      yearlyIncome: true,
      guarantorName: true,
      guarantorPhone: true,
      guarantorRelationship: true,
      ninVerified: true,
      idVerified: true,
      incomeVerified: true,
      profileCompleted: true,
      avatarUrl: true,
      createdAt: true,
    },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  // Serialize BigInt and Date for client component
  const user = {
    fullName: dbUser.fullName,
    email: dbUser.email,
    phone: dbUser.phone,
    profileBio: dbUser.profileBio,
    employmentStatus: dbUser.employmentStatus,
    employmentType: dbUser.employmentType,
    employerName: dbUser.employerName,
    jobTitle: dbUser.jobTitle,
    yearlyIncome: dbUser.yearlyIncome ? dbUser.yearlyIncome.toString() : null,
    guarantorName: dbUser.guarantorName,
    guarantorPhone: dbUser.guarantorPhone,
    guarantorRelationship: dbUser.guarantorRelationship,
    ninVerified: dbUser.ninVerified ?? false,
    idVerified: dbUser.idVerified ?? false,
    incomeVerified: dbUser.incomeVerified ?? false,
    profileCompleted: dbUser.profileCompleted ?? false,
    agentBio: null,
    agentAreas: null,
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Complete your profile to improve your chances with landlords
        </p>
      </div>

      {!dbUser.profileCompleted && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="font-medium text-yellow-800">Profile incomplete</p>
          <p className="text-sm text-yellow-700">
            Fill in your employment and guarantor details to complete your profile.
          </p>
        </div>
      )}

      <ProfileEditForm user={user} role="tenant" locale={params.locale} />
    </div>
  )
}
