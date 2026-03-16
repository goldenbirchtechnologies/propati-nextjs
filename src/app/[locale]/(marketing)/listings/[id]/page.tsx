import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatNaira } from '@/lib/utils'
import TrustBadge from '@/components/shared/TrustBadge'
import { ListingCTA } from '@/components/listings/ListingCTA'
import { MapPin, Bed, Bath, Maximize, Car, Building2, Sofa, ArrowLeft, Shield, User as UserIcon } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string; locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: { title: true, area: true, price: true, description: true, images: { where: { isCover: true }, take: 1, select: { url: true } } },
  })

  if (!listing) return { title: 'Listing not found' }

  const title = `${listing.title} — ${listing.area} | PROPATI`
  const description = listing.description ?? `${listing.title} in ${listing.area} for ${formatNaira(Number(listing.price))}`
  const coverUrl = listing.images[0]?.url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'PROPATI',
      type: 'website',
      ...(coverUrl ? { images: [{ url: coverUrl, width: 800, height: 600, alt: listing.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(coverUrl ? { images: [coverUrl] } : {}),
    },
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const prefix = `/${params.locale}`

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
      owner: { select: { id: true, fullName: true, avatarUrl: true, phone: true } },
      agent: { select: { id: true, fullName: true, avatarUrl: true, phone: true, agentBio: true } },
    },
  })

  if (!listing) notFound()

  // Increment view count (fire-and-forget)
  prisma.listing.update({
    where: { id: listing.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {})

  const coverImage = listing.images.find((img) => img.isCover) ?? listing.images[0]
  const otherImages = listing.images.filter((img) => img.id !== coverImage?.id).slice(0, 4)

  const periodLabel: Record<string, string> = {
    yearly: 'per year',
    monthly: 'per month',
    nightly: 'per night',
    daily: 'per night',
    once: 'total',
  }

  const amenities = (listing.amenities as string[] | null) ?? []

  return (
    <main className="min-h-screen bg-[#f5f3ee]">
      {/* Back nav */}
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <Link href={`${prefix}/`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>
      </div>

      {/* Image gallery */}
      <section className="mx-auto mt-3 max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:grid-rows-2">
          {/* Cover image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-l-xl bg-muted md:col-span-2 md:row-span-2">
            {coverImage ? (
              <Image
                src={coverImage.url}
                alt={listing.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No photos available
              </div>
            )}
          </div>
          {/* Other images */}
          {otherImages.map((img, i) => (
            <div
              key={img.id}
              className={`relative hidden aspect-[4/3] overflow-hidden bg-muted md:block ${
                i === 1 ? 'rounded-tr-xl' : i === 3 ? 'rounded-br-xl' : ''
              }`}
            >
              <Image
                src={img.url}
                alt={`${listing.title} ${i + 2}`}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto mt-6 max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main info */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <TrustBadge tier={listing.verificationTier ?? 'none'} />
              <span className="rounded-full bg-black/10 px-2.5 py-0.5 text-xs font-semibold uppercase">
                {listing.listingType}
              </span>
              <span className="rounded-full bg-black/10 px-2.5 py-0.5 text-xs font-semibold">
                {listing.propertyType}
              </span>
            </div>

            <h1 className="font-display mt-3 text-2xl font-bold md:text-3xl">{listing.title}</h1>

            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {listing.address}, {listing.area}, {listing.state}
            </p>

            {/* Stats */}
            <div className="mt-4 flex flex-wrap gap-4 rounded-xl border bg-white p-4">
              {listing.bedrooms != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Bed className="h-5 w-5 text-gold" />
                  <div>
                    <p className="font-semibold">{listing.bedrooms}</p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </div>
                </div>
              )}
              {listing.bathrooms != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Bath className="h-5 w-5 text-gold" />
                  <div>
                    <p className="font-semibold">{listing.bathrooms}</p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </div>
                </div>
              )}
              {listing.toilets != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-5 w-5 text-gold" />
                  <div>
                    <p className="font-semibold">{listing.toilets}</p>
                    <p className="text-xs text-muted-foreground">Toilets</p>
                  </div>
                </div>
              )}
              {listing.sizeSqm != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Maximize className="h-5 w-5 text-gold" />
                  <div>
                    <p className="font-semibold">{Number(listing.sizeSqm)}m²</p>
                    <p className="text-xs text-muted-foreground">Size</p>
                  </div>
                </div>
              )}
              {(listing.parking_spaces ?? 0) > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Car className="h-5 w-5 text-gold" />
                  <div>
                    <p className="font-semibold">{listing.parking_spaces}</p>
                    <p className="text-xs text-muted-foreground">Parking</p>
                  </div>
                </div>
              )}
              {listing.furnished && (
                <div className="flex items-center gap-2 text-sm">
                  <Sofa className="h-5 w-5 text-gold" />
                  <div>
                    <p className="font-semibold">Yes</p>
                    <p className="text-xs text-muted-foreground">Furnished</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-semibold">Description</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-semibold">Amenities</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border bg-white px-3 py-1 text-xs font-medium"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — pricing + owner + CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Pricing Card */}
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="font-display text-2xl font-bold text-gold">
                  {formatNaira(Number(listing.price))}
                </p>
                {listing.pricePeriod && (
                  <p className="text-sm text-muted-foreground">
                    {periodLabel[listing.pricePeriod] ?? listing.pricePeriod}
                  </p>
                )}

                {listing.cautionDeposit && (
                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground">Caution deposit:</span>{' '}
                    {formatNaira(Number(listing.cautionDeposit))}
                  </p>
                )}
                {listing.serviceCharge && (
                  <p className="mt-1 text-sm">
                    <span className="text-muted-foreground">Service charge:</span>{' '}
                    {formatNaira(Number(listing.serviceCharge))}
                  </p>
                )}

                {/* Listing type badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white ${
                    listing.listingType === 'sale' ? 'bg-gold' :
                    listing.listingType === 'short-let' ? 'bg-rust' :
                    listing.listingType === 'share' ? 'bg-blue-600' :
                    'bg-teal'
                  }`}>
                    {listing.listingType === 'sale' ? 'For Sale' :
                     listing.listingType === 'short-let' ? 'Short-let' :
                     listing.listingType === 'share' ? 'Room Share' :
                     'For Rent'}
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-5 border-t pt-4">
                  <ListingCTA
                    listingId={listing.id}
                    listingType={listing.listingType}
                    ownerId={listing.owner.id}
                    ownerName={listing.owner.fullName}
                    locale={params.locale}
                  />
                </div>
              </div>

              {/* Owner Card */}
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Listed by</p>
                <div className="mt-2 flex items-center gap-3">
                  {listing.owner.avatarUrl ? (
                    <Image
                      src={listing.owner.avatarUrl}
                      alt={listing.owner.fullName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                      <UserIcon className="h-5 w-5 text-gold" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{listing.owner.fullName}</p>
                    <p className="text-xs text-muted-foreground">Property Owner</p>
                  </div>
                </div>
              </div>

              {/* Agent Card (if assigned) */}
              {listing.agent && (
                <div className="rounded-xl border border-teal/20 bg-teal/5 p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-teal" />
                    <p className="text-xs font-medium uppercase tracking-wide text-teal">Managed by Agent</p>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    {listing.agent.avatarUrl ? (
                      <Image
                        src={listing.agent.avatarUrl}
                        alt={listing.agent.fullName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10">
                        <UserIcon className="h-5 w-5 text-teal" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{listing.agent.fullName}</p>
                      {listing.agent.agentBio && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{listing.agent.agentBio}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
