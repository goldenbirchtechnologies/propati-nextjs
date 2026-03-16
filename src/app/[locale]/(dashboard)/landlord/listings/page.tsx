import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Building2, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { LandlordListingCard } from '@/components/listings/LandlordListingCard'

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

  const rawListings = await prisma.listing.findMany({
    where,
    include: {
      images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }], take: 1 },
      agent: { select: { id: true, fullName: true, email: true } },
      _count: { select: { agreements: true, savedBy: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Serialize for client component (convert Decimal/Date)
  const listings = rawListings.map((l) => ({
    id: l.id,
    title: l.title,
    area: l.area,
    state: l.state,
    price: Number(l.price),
    pricePeriod: l.pricePeriod,
    status: l.status,
    verificationTier: l.verificationTier,
    viewsCount: l.viewsCount ?? 0,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    sizeSqm: l.sizeSqm ? Number(l.sizeSqm) : null,
    imageUrl: l.images[0]?.url ?? null,
    savedCount: l._count.savedBy,
    agreementCount: l._count.agreements,
    agent: l.agent ? { id: l.agent.id, fullName: l.agent.fullName, email: l.agent.email } : null,
  }))

  const statuses = ['all', 'active', 'draft', 'suspended']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Properties</h1>
          <p className="text-sm text-muted-foreground">
            {listings.length} listing{listings.length !== 1 ? 's' : ''}
          </p>
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
            <LandlordListingCard
              key={listing.id}
              listing={listing}
              locale={params.locale}
            />
          ))}
        </div>
      )}
    </div>
  )
}
