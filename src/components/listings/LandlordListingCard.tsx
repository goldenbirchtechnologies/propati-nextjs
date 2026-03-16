'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Eye, UserPlus, UserMinus } from 'lucide-react'
import TrustBadge from '@/components/shared/TrustBadge'
import { AssignAgentModal } from './AssignAgentModal'

interface ListingData {
  id: string
  title: string
  area: string
  state: string
  price: number
  pricePeriod: string | null
  status: string | null
  verificationTier: string | null
  viewsCount: number
  bedrooms: number | null
  bathrooms: number | null
  sizeSqm: number | null
  imageUrl: string | null
  savedCount: number
  agreementCount: number
  agent: { id: string; fullName: string; email: string } | null
}

export function LandlordListingCard({
  listing,
  locale,
}: {
  listing: ListingData
  locale: string
}) {
  const [showAssign, setShowAssign] = useState(false)
  const [agent, setAgent] = useState(listing.agent)
  const prefix = `/${locale}/landlord`

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-[16/10] bg-muted">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
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
          <p className="mt-0.5 text-sm text-muted-foreground">
            {listing.area}, {listing.state}
          </p>
          <p className="mt-2 text-lg font-bold text-gold">
            ₦{listing.price.toLocaleString()}
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
              {listing.viewsCount} views
            </span>
            <span>{listing.savedCount} saved</span>
            <span>
              {listing.agreementCount} agreement
              {listing.agreementCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Property details */}
          <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
            {listing.bedrooms != null && <span>{listing.bedrooms} bed</span>}
            {listing.bathrooms != null && <span>{listing.bathrooms} bath</span>}
            {listing.sizeSqm != null && <span>{listing.sizeSqm} sqm</span>}
          </div>

          {/* Agent badge */}
          <div className="mt-3">
            {agent ? (
              <div className="flex items-center justify-between rounded-lg bg-rust/5 px-3 py-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Agent: </span>
                  <span className="font-medium text-rust">{agent.fullName}</span>
                </div>
                <button
                  onClick={() => setShowAssign(true)}
                  className="text-xs font-medium text-rust hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAssign(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-rust/40 px-3 py-2 text-xs font-medium text-rust hover:bg-rust/5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Assign Agent
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <Link
              href={`/${locale}/listings/${listing.id}`}
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

      {showAssign && (
        <AssignAgentModal
          listingId={listing.id}
          currentAgent={agent}
          onClose={() => setShowAssign(false)}
          onAssigned={() => {
            setShowAssign(false)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
