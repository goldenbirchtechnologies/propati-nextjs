export const dynamic = 'force-dynamic'

import { Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function BookingsPage({
  params,
}: {
  params: { locale: string }
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Your short stay reservations</p>
      </div>

      <div className="rounded-xl border bg-white p-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">No bookings yet</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Browse short-stay properties and book your next stay.
        </p>
        <Link
          href={`/${params.locale}/listings?type=short_let`}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Browse Short Stays
        </Link>
      </div>
    </div>
  )
}
