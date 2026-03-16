import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { User, Mail, Phone, Shield, Calendar, Building2 } from 'lucide-react'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function LandlordProfile({
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
      createdAt: true,
      _count: { select: { listings: true } },
    },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const verificationScore = [dbUser.ninVerified, dbUser.idVerified].filter(Boolean).length

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Profile card */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gold/10">
            {dbUser.avatarUrl ? (
              <img src={dbUser.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-gold" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{dbUser.fullName}</h2>
            <span className="inline-block rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
              Landlord
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
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{dbUser._count.listings} properties listed</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Joined {dbUser.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }) : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Verification status */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="font-semibold">Identity Verification</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Verification score: {verificationScore}/2
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">NIN Verification</span>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              dbUser.ninVerified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              {dbUser.ninVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">ID Verification</span>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              dbUser.idVerified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              {dbUser.idVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
