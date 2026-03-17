export const dynamic = 'force-dynamic'

import { ShoppingCart, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function OffersPage({
  params,
}: {
  params: { locale: string }
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Offers</h1>
        <p className="text-sm text-gray-500 mt-1">Track your property purchase offers</p>
      </div>

      <div className="rounded-xl border bg-white p-12 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">No offers yet</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Browse properties for sale and make your first offer.
        </p>
        <Link
          href={`/${params.locale}/listings?type=sale`}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Browse Properties for Sale
        </Link>
      </div>
    </div>
  )
}
