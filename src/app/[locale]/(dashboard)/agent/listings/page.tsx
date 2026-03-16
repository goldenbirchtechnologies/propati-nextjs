import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Building2, Eye } from 'lucide-react'
import Link from 'next/link'
import TrustBadge from '@/components/shared/TrustBadge'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function AgentListings({
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

  const listings = await prisma.listing.findMany({
    where: { agentId: dbUser.id },
    include: {
      images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }], take: 1 },
      owner: { select: { fullName: true } },
      _count: { select: { agreements: true, savedBy: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Managed Listings</h1>
        <p className="text-sm text-muted-foreground">
          {listings.length} listing{listings.length !== 1 ? 's' : ''} under management
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No managed listings</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Listings assigned to you as an agent will appear here
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] bg-muted">
                {listing.images[0] ? (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
                {/* Status badge */}
                <span
                  className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    listing.status === 'active'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {listing.status}
                </span>
                {listing.verificationTier && listing.verificationTier !== 'none' && (
                  <div className="absolute right-3 top-3">
                    <TrustBadge tier={listing.verificationTier} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="truncate font-semibold">{listing.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Owner: {listing.owner?.fullName ?? 'Unknown'}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {listing.area}, {listing.state}
                </p>
                <p className="mt-2 text-lg font-bold text-rust">
                  ₦{Number(listing.price).toLocaleString()}
                  {listing.pricePeriod && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /{listing.pricePeriod}
                    </span>
                  )}
                </p>

                {/* Stats */}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {listing.viewsCount ?? 0} views
                  </span>
                  <span>{listing._count.savedBy} saved</span>
                  <span>
                    {listing._count.agreements} agreement
                    {listing._count.agreements !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Action */}
                <div className="mt-4">
                  <Link
                    href={`/${params.locale}/listings/${listing.id}`}
                    className="block w-full rounded-lg border px-3 py-1.5 text-center text-xs font-medium text-rust hover:bg-rust/5"
                  >
                    View Listing
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
