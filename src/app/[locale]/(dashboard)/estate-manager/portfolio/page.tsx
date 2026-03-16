import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Building2 } from 'lucide-react'
import Link from 'next/link'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function EMPortfolio({
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

  const org = await prisma.organisation.findFirst({
    where: { ownerId: dbUser.id },
  })

  const prefix = `/${params.locale}/estate-manager`

  if (!org) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Building2 className="h-10 w-10 text-blue-600" />
        <h1 className="text-2xl font-bold">No Organisation</h1>
        <p className="text-sm text-muted-foreground">Create an organisation first to manage your portfolio.</p>
        <Link
          href={`${prefix}/create-org`}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Organisation
        </Link>
      </div>
    )
  }

  const orgListings = await prisma.orgListing.findMany({
    where: { orgId: org.id },
    include: {
      listing: {
        include: {
          images: { where: { isCover: true }, take: 1 },
          agreements: {
            where: { status: 'fully_signed' },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { added_at: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            {orgListings.length} propert{orgListings.length !== 1 ? 'ies' : 'y'} in {org.name}
          </p>
        </div>
      </div>

      {orgListings.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No properties yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add listings to your organisation to manage them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgListings.map(({ listing }) => {
            const coverImage = listing.images[0]
            const tenantCount = listing.agreements.length
            return (
              <div
                key={listing.id}
                className="overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md"
              >
                {/* Image */}
                <div className="relative h-40 w-full bg-muted">
                  {coverImage ? (
                    <img
                      src={coverImage.url}
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
                    className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      listing.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : listing.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-700'
                          : listing.status === 'rented'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {listing.status ?? 'draft'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="truncate font-semibold">{listing.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {listing.area}, {listing.state}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600">
                      ₦{Number(listing.price).toLocaleString()}
                      {listing.pricePeriod && (
                        <span className="font-normal text-muted-foreground">
                          /{listing.pricePeriod}
                        </span>
                      )}
                    </p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{tenantCount}</span>
                      {tenantCount === 1 ? 'tenant' : 'tenants'}
                    </span>
                  </div>
                  {(listing.bedrooms || listing.bathrooms) && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {listing.bedrooms ? `${listing.bedrooms} bed` : ''}
                      {listing.bedrooms && listing.bathrooms ? ' · ' : ''}
                      {listing.bathrooms ? `${listing.bathrooms} bath` : ''}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
