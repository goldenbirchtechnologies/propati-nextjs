'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Loader2, Send, Calendar, ShoppingCart, Users, MessageSquare, Heart } from 'lucide-react'

interface ListingCTAProps {
  listingId: string
  listingType: string
  ownerId: string
  ownerName: string
  locale: string
}

const CTA_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  rent: { label: 'Apply to Rent', icon: Send, color: 'bg-teal hover:bg-teal/90' },
  sale: { label: 'Make an Offer', icon: ShoppingCart, color: 'bg-gold hover:bg-gold/90' },
  'short-let': { label: 'Book Now', icon: Calendar, color: 'bg-rust hover:bg-rust/90' },
  share: { label: 'Request to Share', icon: Users, color: 'bg-blue-600 hover:bg-blue-700' },
  commercial: { label: 'Enquire Now', icon: MessageSquare, color: 'bg-gold hover:bg-gold/90' },
}

export function ListingCTA({ listingId, listingType, ownerId, ownerName, locale }: ListingCTAProps) {
  const { isSignedIn, user } = useUser()
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const config = CTA_CONFIG[listingType] ?? CTA_CONFIG.rent

  async function handleApply() {
    setApplying(true)
    setError('')

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, listingType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to apply')
      setApplied(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setApplying(false)
    }
  }

  async function handleSave() {
    try {
      const res = await fetch('/api/listings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      if (res.ok) setSaved(true)
    } catch {}
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="space-y-3">
        <Link
          href={`/${locale}/sign-in`}
          className="block w-full rounded-lg bg-gold py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          Sign in to {config.label.split(' ').slice(0, -1).join(' ') || 'Apply'}
        </Link>
        <Link
          href={`/${locale}/sign-up`}
          className="block w-full rounded-lg border border-gold py-2.5 text-center text-sm font-medium text-gold transition-colors hover:bg-gold/5"
        >
          Create Account
        </Link>
      </div>
    )
  }

  // Already applied
  if (applied) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
          <p className="font-semibold text-green-800">
            {listingType === 'short-let' ? 'Booking Request Sent!' :
             listingType === 'sale' ? 'Offer Submitted!' :
             listingType === 'share' ? 'Share Request Sent!' :
             'Application Submitted!'}
          </p>
          <p className="mt-1 text-xs text-green-700">
            {ownerName} will review and respond. Check your messages for updates.
          </p>
        </div>
        <Link
          href={`/${locale}/tenant/messages`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium hover:bg-muted"
        >
          <MessageSquare className="h-4 w-4" />
          Go to Messages
        </Link>
      </div>
    )
  }

  const Icon = config.icon

  return (
    <div className="space-y-3">
      {/* Main CTA */}
      <button
        onClick={handleApply}
        disabled={applying}
        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${config.color}`}
      >
        {applying ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        {applying ? 'Submitting...' : config.label}
      </button>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saved}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
          saved
            ? 'border-red-200 bg-red-50 text-red-600'
            : 'hover:bg-muted'
        }`}
      >
        <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
        {saved ? 'Saved' : 'Save Property'}
      </button>

      {/* Contact landlord */}
      <Link
        href={`/${locale}/tenant/messages?to=${ownerId}`}
        className="flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
      >
        <MessageSquare className="h-4 w-4" />
        Message {ownerName}
      </Link>

      {error && (
        <p className="text-center text-xs text-red-600">{error}</p>
      )}

      {/* Type-specific info */}
      {listingType === 'short-let' && (
        <p className="text-xs text-muted-foreground text-center">
          Short-let bookings are confirmed after landlord approval
        </p>
      )}
      {listingType === 'share' && (
        <p className="text-xs text-muted-foreground text-center">
          Room sharing requires mutual agreement between all parties
        </p>
      )}
    </div>
  )
}
