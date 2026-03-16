import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatNaira } from '@/lib/utils'
import { Heart, MapPin, Bed, Bath } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SavedPropertiesPage({ params }: { params: { locale: string } }) {
  const { userId } = auth()
  if (!userId) redirect(`/${params.locale}/sign-in`)

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  })

  if (!user) redirect(`/${params.locale}/sign-in`)

  const savedListings = await prisma.savedListing.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        include: {
          images: { where: { isCover: true }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Properties</h1>
        <p className="text-sm text-muted-foreground">
          {savedListings.length} {savedListings.length === 1 ? 'property' : 'properties'} saved
        </p>
      </div>

      {savedListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-20 text-center">
          <div className="mb-4 rounded-full bg-gold/10 p-4">
            <Heart className="h-8 w-8 text-gold" />
          </div>
          <h3 className="text-lg font-semibold">No saved properties</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Browse listings and tap the heart icon to save properties you&apos;re interested in.
          </p>
          <Link
            href={`/${params.locale}/`}
            className="mt-4 rounded-lg bg-gold px-6 py-2 text-sm font-semibold text-white hover:bg-gold/90"
          >
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedListings.map(({ listing }) => {
            const coverUrl = listing.images[0]?.url
            return (
              <Link
                key={listing.id}
                href={`/${params.locale}/listings/${listing.id}`}
                className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                  <span className={`absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
                    listing.listingType === 'sale' ? 'bg-gold' :
                    listing.listingType === 'short-let' ? 'bg-rust' :
                    listing.listingType === 'share' ? 'bg-blue-600' :
                    'bg-teal'
                  }`}>
                    {listing.listingType === 'sale' ? 'For Sale' :
                     listing.listingType === 'short-let' ? 'Short-let' :
                     listing.listingType === 'share' ? 'Share' :
                     'For Rent'}
                  </span>
                  <Heart className="absolute top-2 right-2 h-5 w-5 fill-red-500 text-red-500" />
                </div>
                <div className="p-4">
                  <p className="font-display font-bold text-gold">
                    {formatNaira(Number(listing.price))}
                  </p>
                  <h3 className="mt-1 font-semibold line-clamp-1">{listing.title}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {listing.area}, {listing.state}
                  </p>
                  <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                    {listing.bedrooms != null && (
                      <span className="flex items-center gap-1">
                        <Bed className="h-3.5 w-3.5" /> {listing.bedrooms} bed
                      </span>
                    )}
                    {listing.bathrooms != null && (
                      <span className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5" /> {listing.bathrooms} bath
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
