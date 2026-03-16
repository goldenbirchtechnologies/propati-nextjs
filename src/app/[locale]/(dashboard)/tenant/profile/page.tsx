import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { User, Mail, Phone, Shield, Calendar, Briefcase, BadgeCheck } from 'lucide-react'

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
      avatarUrl: true,
      ninVerified: true,
      idVerified: true,
      incomeVerified: true,
      profileCompleted: true,
      employmentStatus: true,
      employmentType: true,
      employerName: true,
      jobTitle: true,
      profileBio: true,
      guarantorName: true,
      guarantorPhone: true,
      guarantorRelationship: true,
      createdAt: true,
    },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const verificationScore = [dbUser.ninVerified, dbUser.idVerified, dbUser.incomeVerified, dbUser.profileCompleted].filter(Boolean).length

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Completion banner */}
      {!dbUser.profileCompleted && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="font-medium text-yellow-800">Profile incomplete</p>
          <p className="text-sm text-yellow-700">
            Complete your profile to improve your verification score and chances with landlords.
          </p>
        </div>
      )}

      {/* Profile card */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-teal/10">
            {dbUser.avatarUrl ? (
              <img src={dbUser.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-teal" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{dbUser.fullName}</h2>
            <span className="inline-block rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-medium text-teal">
              Tenant
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{dbUser.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{dbUser.phone ?? 'Not set'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Joined {dbUser.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }) : 'N/A'}
            </span>
          </div>
          {dbUser.profileBio && (
            <div className="mt-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              {dbUser.profileBio}
            </div>
          )}
        </div>
      </div>

      {/* Employment */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="flex items-center gap-2 font-semibold">
          <Briefcase className="h-4 w-4" />
          Employment Details
        </h3>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">{dbUser.employmentStatus?.replace('_', ' ') ?? 'Not provided'}</span>
          </div>
          {dbUser.employmentType && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{dbUser.employmentType.replace('_', ' ')}</span>
            </div>
          )}
          {dbUser.employerName && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Employer</span>
              <span className="font-medium">{dbUser.employerName}</span>
            </div>
          )}
          {dbUser.jobTitle && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Job Title</span>
              <span className="font-medium">{dbUser.jobTitle}</span>
            </div>
          )}
        </div>
      </div>

      {/* Guarantor */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="font-semibold">Guarantor</h3>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{dbUser.guarantorName ?? 'Not provided'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium">{dbUser.guarantorPhone ?? 'Not provided'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Relationship</span>
            <span className="font-medium capitalize">{dbUser.guarantorRelationship ?? 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="flex items-center gap-2 font-semibold">
          <BadgeCheck className="h-4 w-4" />
          Verification Score: {verificationScore}/4
        </h3>
        <div className="mt-4 space-y-3">
          {[
            { label: 'NIN Verified', done: dbUser.ninVerified },
            { label: 'ID Verified', done: dbUser.idVerified },
            { label: 'Income Verified', done: dbUser.incomeVerified },
            { label: 'Profile Completed', done: dbUser.profileCompleted },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.label}</span>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                item.done ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
                {item.done ? 'Done' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
