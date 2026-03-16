import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Building2, Eye, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import TrustBadge from '@/components/shared/TrustBadge'

export const dynamic = 'force-dynamic'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function LandlordListings({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { status?: string }
}) {
  const clerkUserId = await getAuthUserId()
  if (!clerkUserId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const prefix = `/${params.locale}/landlord`
  const statusFilter = searchParams.status

  const where: any = { ownerId: dbUser.id }
  if (statusFilter && statusFilter !== 'all') {
    where.status = statusFilter
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }], take: 1 },
      _count: { select: { agreements: true, savedBy: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const statuses = ['all', 'active', 'draft', 'suspended']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Properties</h1>
          <p className="text-sm text-muted-foreground">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href={`${prefix}/listings/new`}
          className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold/90"
        >
          <PlusCircle className="h-4 w-4" />
          Add Listing
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === 'all' ? `${prefix}/listings` : `${prefix}/listings?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              (statusFilter ?? 'all') === s
                ? 'bg-gold text-white'
                : 'bg-white text-muted-foreground hover:bg-muted'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No listings found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {statusFilter ? `No ${statusFilter} listings` : 'Create your first property listing'}
          </p>
          <Link
            href={`${prefix}/listings/new`}
            className="mt-4 inline-block rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold/90"
          >
            Add Listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing.id} className="overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md">
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
                      : listing.status === 'draft'
                        ? 'bg-yellow-500 text-white'
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
                <p className="mt-0.5 text-sm text-muted-foreground">{listing.area}, {listing.state}</p>
                <p className="mt-2 text-lg font-bold text-gold">
                  ₦{Number(listing.price).toLocaleString()}
                  {listing.pricePeriod && (
                    <span className="text-sm font-normal text-muted-foreground">/{listing.pricePeriod}</span>
                  )}
                </p>

                {/* Stats */}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {listing.viewsCount ?? 0} views
                  </span>
                  <span>{listing._count.savedBy} saved</span>
                  <span>{listing._count.agreements} agreement{listing._count.agreements !== 1 ? 's' : ''}</span>
                </div>

                {/* Property details */}
                <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                  {listing.bedrooms != null && <span>{listing.bedrooms} bed</span>}
                  {listing.bathrooms != null && <span>{listing.bathrooms} bath</span>}
                  {listing.sizeSqm != null && <span>{Number(listing.sizeSqm)} sqm</span>}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/${params.locale}/listings/${listing.id}`}
                    className="flex-1 rounded-lg border px-3 py-1.5 text-center text-xs font-medium hover:bg-muted"
                  >
                    View
                  </Link>
                  <Link
                    href={`${prefix}/listings/${listing.id}/edit`}
                    className="flex-1 rounded-lg bg-gold/10 px-3 py-1.5 text-center text-xs font-medium text-gold hover:bg-gold/20"
                  >
                    Edit
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
