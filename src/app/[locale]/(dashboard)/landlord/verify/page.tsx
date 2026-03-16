import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Shield, Building2 } from 'lucide-react'
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

const layerLabels = [
  { layer: 1, name: 'Document Upload', desc: 'Upload C of O, Deed, Survey, or Governor\'s Consent' },
  { layer: 2, name: 'Identity Verification', desc: 'NIN verification via Dojah' },
  { layer: 3, name: 'Live Proof', desc: 'Upload video with QR code at the property' },
  { layer: 4, name: 'Physical Inspection', desc: 'Schedule agent visit to verify property' },
  { layer: 5, name: 'Final Certification', desc: 'Admin review and certification' },
]

export default async function LandlordVerify({
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

  const prefix = `/${params.locale}/landlord`

  const listings = await prisma.listing.findMany({
    where: { ownerId: dbUser.id },
    include: {
      verification: true,
      images: { orderBy: { isCover: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  function tierBadge(tier: string) {
    switch (tier) {
      case 'certified': return { label: 'Certified', className: 'bg-teal text-white' }
      case 'inspected': return { label: 'Inspected', className: 'bg-teal/80 text-white' }
      case 'verified': return { label: 'Verified', className: 'bg-gold text-white' }
      default: return { label: 'Basic', className: 'bg-gray-200 text-gray-600' }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Property Verification</h1>
        <p className="text-sm text-muted-foreground">
          Verify your properties to earn trust badges and rank higher in search results
        </p>
      </div>

      {/* Verification info */}
      <div className="rounded-xl border bg-gradient-to-r from-teal/5 to-gold/5 p-4">
        <h3 className="font-semibold">5-Layer Verification System</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Each layer increases your property&apos;s trust score. Complete all 5 layers to earn the Certified badge.
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          {layerLabels.map((l) => (
            <div key={l.layer} className="flex items-center gap-2 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal/10 text-xs font-bold text-teal">
                {l.layer}
              </span>
              <span className="text-muted-foreground">{l.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Properties */}
      {listings.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No properties to verify</p>
          <p className="mt-1 text-sm text-muted-foreground">Add a listing first, then start the verification process</p>
          <Link
            href={`${prefix}/listings/new`}
            className="mt-4 inline-block rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold/90"
          >
            Add Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const v = listing.verification
            const tier = tierBadge(listing.verificationTier ?? 'basic')
            const currentLayer = v?.currentLayer ?? 0
            const progress = v ? Math.round((Math.max(0, currentLayer - 1) / 5) * 100) : 0

            return (
              <div key={listing.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {listing.images[0] ? (
                      <img src={listing.images[0].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{listing.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tier.className}`}>
                        {tier.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{listing.area}, {listing.state}</p>

                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-teal transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {v ? `Layer ${currentLayer}/5` : 'Not started'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Layer status */}
                {v && (
                  <div className="mt-3 flex gap-1">
                    {layerLabels.map((l) => {
                      const layerKey = `l${l.layer}Status` as keyof typeof v
                      const status = v[layerKey] as string
                      return (
                        <div
                          key={l.layer}
                          className={`flex-1 rounded py-1 text-center text-[10px] font-medium ${
                            status === 'approved' ? 'bg-green-50 text-green-700' :
                            status === 'rejected' ? 'bg-red-50 text-red-700' :
                            l.layer === currentLayer ? 'bg-yellow-50 text-yellow-700' :
                            'bg-gray-50 text-gray-400'
                          }`}
                        >
                          L{l.layer}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
