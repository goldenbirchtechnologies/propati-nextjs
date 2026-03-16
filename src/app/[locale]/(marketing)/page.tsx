import { prisma } from '@/lib/prisma'
import ListingCard from '@/components/listings/ListingCard'
import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const LISTING_TYPES = [
  { value: '', label: 'All' },
  { value: 'rent', label: 'Rent' },
  { value: 'sale', label: 'Buy' },
  { value: 'short-let', label: 'Short-let' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'share', label: 'Share' },
]

export default async function HomePage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { type?: string; q?: string }
}) {
  const locale = params.locale
  const activeType = searchParams.type ?? ''
  const query = searchParams.q ?? ''

  const where: any = { status: 'active' }
  if (activeType) where.listingType = activeType
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { address: { contains: query, mode: 'insensitive' } },
      { area: { contains: query, mode: 'insensitive' } },
    ]
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      images: {
        orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        take: 3,
      },
      owner: { select: { id: true, fullName: true, avatarUrl: true } },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: 24,
  })

  return (
    <main className="min-h-screen bg-[#f5f3ee]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between bg-[#1a1a1a]/95 px-4 py-3 backdrop-blur-sm md:px-8">
        <Link href={`/${locale}`} className="flex items-center gap-1">
          <span className="font-display text-xl font-bold text-white">
            <span className="text-gold">P</span>ROPATI
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/sign-in`}
            className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href={`/${locale}/sign-up`}
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#1a1a1a] to-[#2d2418] px-4 pb-16 pt-16 text-center text-white">
        <p className="mx-auto mb-2 inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-xs font-medium tracking-wide text-gold">
          Nigeria&apos;s most trusted property marketplace
        </p>
        <h1 className="font-display mx-auto max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
          Find your next home in Nigeria.
        </h1>
        <p className="font-display mx-auto mt-2 text-lg font-semibold text-gold">
          Verified. Trusted. Fast.
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/70">
          Every listing screened with our 5-layer verification — documents, identity, live proof, inspection and certification.
        </p>

        {/* Search bar */}
        <form
          action=""
          method="GET"
          className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur"
        >
          <input type="hidden" name="type" value={activeType} />
          <div className="flex flex-1 items-center gap-2 px-4">
            <Search className="h-4 w-4 text-white/50" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search area, street, type (e.g. 3-bed Lekki rent)…"
              className="w-full bg-transparent py-3 text-sm text-white placeholder-white/40 outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-gold px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            Search
          </button>
        </form>
      </section>

      {/* Type tabs + listings */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {LISTING_TYPES.map((t) => {
            const isActive = activeType === t.value
            return (
              <Link
                key={t.value}
                href={`/?type=${t.value}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold text-white'
                    : 'border bg-white text-muted-foreground hover:border-gold hover:text-gold'
                }`}
              >
                {t.label}
              </Link>
            )
          })}
        </div>

        {/* Grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-gold/10 p-4">
              <Search className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-lg font-semibold">No listings yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Landlords haven&apos;t posted any properties yet.
            </p>
            <Link
              href="/dashboard/landlord/listings/new"
              className="mt-4 rounded-full bg-gold px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
            >
              List a Property →
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
