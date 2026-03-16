import { prisma } from '@/lib/prisma'
import { Search } from 'lucide-react'
import Link from 'next/link'
import ListingCard from '@/components/listings/ListingCard'

export const dynamic = 'force-dynamic'

export default async function TenantSearch({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { type?: string; q?: string; area?: string; minPrice?: string; maxPrice?: string; bedrooms?: string }
}) {
  const locale = params.locale
  const { type, q, area, minPrice, maxPrice, bedrooms } = searchParams

  const where: any = { status: 'active' }
  if (type) where.listingType = type
  if (area) where.area = { contains: area, mode: 'insensitive' }
  if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms, 10) }
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { address: { contains: q, mode: 'insensitive' } },
      { area: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }], take: 5 },
      owner: { select: { id: true, fullName: true, avatarUrl: true } },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: 40,
  })

  const types = [
    { value: '', label: 'All' },
    { value: 'rent', label: 'Rent' },
    { value: 'sale', label: 'Buy' },
    { value: 'short-let', label: 'Short-let' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'share', label: 'Share' },
  ]

  const prefix = `/${locale}/tenant/search`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Find Property</h1>
        <p className="text-sm text-muted-foreground">Browse verified properties across Nigeria</p>
      </div>

      {/* Search bar */}
      <form action={prefix} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by area, address, or title..."
            className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
          />
        </div>
        <select
          name="area"
          defaultValue={area}
          className="rounded-lg border px-3 py-2 text-sm focus:border-teal focus:outline-none"
        >
          <option value="">All Areas</option>
          {['Lekki', 'Victoria Island', 'Ikoyi', 'Ajah', 'Surulere', 'Yaba', 'Ikeja', 'Gbagada', 'Magodo'].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          name="bedrooms"
          defaultValue={bedrooms}
          className="hidden rounded-lg border px-3 py-2 text-sm focus:border-teal focus:outline-none sm:block"
        >
          <option value="">Beds</option>
          {[1, 2, 3, 4, 5].map((b) => (
            <option key={b} value={b}>{b}+</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal/90"
        >
          Search
        </button>
      </form>

      {/* Type tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {types.map((t) => (
          <Link
            key={t.value}
            href={t.value ? `${prefix}?type=${t.value}${q ? `&q=${q}` : ''}` : `${prefix}${q ? `?q=${q}` : ''}`}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              (type ?? '') === t.value
                ? 'bg-teal text-white'
                : 'bg-white text-muted-foreground hover:bg-muted'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Results */}
      {listings.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No properties found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing: any) => (
            <ListingCard key={listing.id} listing={listing} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
