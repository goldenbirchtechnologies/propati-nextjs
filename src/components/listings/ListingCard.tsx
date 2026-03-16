import Link from 'next/link'
import Image from 'next/image'
import { formatNaira, timeAgo } from '@/lib/utils'
import TrustBadge from '@/components/shared/TrustBadge'
import type { Listing } from '@/types'
import { MapPin, Bed, Bath, Maximize } from 'lucide-react'

const periodLabel: Record<string, string> = {
  yearly: '/yr',
  monthly: '/mo',
  nightly: '/night',
  daily: '/night',
  once: '',
}

export default function ListingCard({ listing, locale = 'en' }: { listing: Listing; locale?: string }) {
  const coverImage = listing.images?.find((img) => img.isCover) ?? listing.images?.[0]
  const period = listing.pricePeriod ? periodLabel[listing.pricePeriod] ?? '' : ''
  return (
    <Link
      href={`/${locale}/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No photo
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <TrustBadge tier={listing.verificationTier ?? 'none'} />
          {listing.listingType && (
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
              {listing.listingType}
            </span>
          )}
        </div>

        {listing.isFeatured && (
          <span className="absolute right-2 top-2 rounded-full bg-rust px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Featured
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display text-lg font-bold text-foreground">
            {formatNaira(Number(listing.price))}
            <span className="text-xs font-normal text-muted-foreground">{period}</span>
          </p>
        </div>

        <h3 className="mt-1 truncate text-sm font-semibold text-foreground">
          {listing.title}
        </h3>

        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {listing.area}, {listing.state}
        </p>

        {/* Stats row */}
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" /> {listing.bedrooms}
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {listing.bathrooms}
            </span>
          )}
          {listing.sizeSqm != null && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" /> {Number(listing.sizeSqm)}m²
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground">
          <span>{listing.owner?.fullName ?? 'Owner'}</span>
          <span>{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}
