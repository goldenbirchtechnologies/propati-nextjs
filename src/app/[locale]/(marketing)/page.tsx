import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import ListingCard from '@/components/listings/ListingCard'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import AuthNavButtons from '@/components/shared/AuthNavButtons'
import { Search, Star, CheckCircle, ShieldCheck, AlertCircle, Building2, Users, Headphones, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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

  // Check if user is authenticated
  let userRole: string | null = null
  try {
    const { userId } = auth()
    if (userId) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        select: { role: true },
      })
      userRole = dbUser?.role ?? null
    }
  } catch {}


  let listings: any[] = []
  try {
    // 10-second timeout so the page renders even if DB is slow
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 10000))
    const where: any = { status: 'active' }
    if (activeType) where.listingType = activeType
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { area: { contains: query, mode: 'insensitive' } },
      ]
    }

    const rawListings = (await Promise.race([prisma.listing.findMany({
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
    }), timeout])) as any[]

    // Explicitly convert Prisma Decimal/Date/Json to plain JS values
    listings = rawListings.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description ?? null,
      listingType: l.listingType,
      propertyType: l.propertyType,
      address: l.address,
      area: l.area,
      state: l.state,
      price: Number(l.price),
      pricePeriod: l.pricePeriod ?? null,
      bedrooms: l.bedrooms ?? null,
      bathrooms: l.bathrooms ?? null,
      sizeSqm: l.sizeSqm ? Number(l.sizeSqm) : null,
      furnished: l.furnished ?? false,
      amenities: l.amenities ? (l.amenities as string[]) : null,
      status: l.status ?? 'draft',
      isFeatured: l.isFeatured ?? false,
      verificationTier: l.verificationTier ?? 'none',
      viewsCount: l.viewsCount ?? 0,
      createdAt: l.createdAt ? l.createdAt.toISOString() : new Date().toISOString(),
      images: (l.images ?? []).map((img: any) => ({
        id: img.id,
        url: img.url,
        isCover: img.isCover,
        sortOrder: img.sortOrder,
      })),
      owner: l.owner
        ? { id: l.owner.id, fullName: l.owner.fullName, avatarUrl: l.owner.avatarUrl ?? null }
        : null,
    }))
  } catch (error) {
    console.error('Failed to fetch listings:', error)
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee]">
      {/* ───────── Navbar ───────── */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-8">
            <Link href={`/${locale}`} className="flex items-center">
              <Image src="/logo.svg" alt="PROPATI" width={140} height={32} className="h-8 w-auto" priority />
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href={`/${locale}?type=`}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#2563EB]"
              >
                Browse
              </Link>
              <Link
                href={`/${locale}/about`}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#2563EB]"
              >
                About
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#2563EB]"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="light" />
            <AuthNavButtons locale={locale} userRole={userRole} />
          </div>
        </div>
      </nav>

      {/* ───────── Hero ───────── */}
      <section className="relative bg-gradient-to-br from-[#1e3a8a] to-[#1d4ed8] px-4 pb-20 pt-20 text-center text-white">
        <p className="mx-auto mb-4 inline-block rounded-full border border-[#2563EB]/40 bg-[#2563EB]/10 px-5 py-1.5 text-xs font-medium tracking-wide text-[#2563EB]">
          Nigeria&apos;s most trusted property marketplace
        </p>
        <h1 className="font-display mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          Find your next home in Nigeria.
        </h1>
        <p className="font-display mx-auto mt-3 text-xl font-semibold text-[#2563EB] md:text-2xl">
          Verified. Trusted. Fast.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
          Every listing screened with our 5-layer verification &mdash; documents, identity, live proof, inspection and certification.
        </p>

        {/* Search bar */}
        <form
          action=""
          method="GET"
          className="mx-auto mt-10 flex max-w-2xl overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur"
        >
          <input type="hidden" name="type" value={activeType} />
          <div className="flex flex-1 items-center gap-2 px-5">
            <Search className="h-5 w-5 shrink-0 text-white/50" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search area, street, type (e.g. 3-bed Lekki rent)..."
              className="w-full bg-transparent py-3.5 text-sm text-white placeholder-white/40 outline-none md:text-base"
            />
          </div>
          <button
            type="submit"
            className="bg-[#2563EB] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] md:text-base"
          >
            Search
          </button>
        </form>
      </section>

      {/* ───────── Stats Bar ───────── */}
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4 md:py-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <Building2 className="h-7 w-7 text-[#2563EB]" />
            <span className="text-2xl font-bold text-[#1a1a1a] md:text-3xl">{listings.length}+</span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Active Listings</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <ShieldCheck className="h-7 w-7 text-[#0e7c6a]" />
            <span className="text-2xl font-bold text-[#1a1a1a] md:text-3xl">5-Layer</span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Verification</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle className="h-7 w-7 text-[#0e7c6a]" />
            <span className="text-2xl font-bold text-[#1a1a1a] md:text-3xl">Escrow</span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Protected</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <Headphones className="h-7 w-7 text-[#d4622a]" />
            <span className="text-2xl font-bold text-[#1a1a1a] md:text-3xl">24hr</span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Support</span>
          </div>
        </div>
      </section>

      {/* ───────── Type Tabs + Listing Grid ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <h2 className="mb-2 text-center text-2xl font-bold text-[#1a1a1a] md:text-3xl">
          Browse Properties
        </h2>
        <p className="mb-8 text-center text-sm text-gray-500">
          Explore verified listings across Nigeria
        </p>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {LISTING_TYPES.map((t) => {
            const isActive = activeType === t.value
            return (
              <Link
                key={t.value}
                href={`/${locale}?type=${t.value}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-[#2563EB] hover:text-[#2563EB]'
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
            <div className="mb-4 rounded-full bg-[#2563EB]/10 p-4">
              <Search className="h-8 w-8 text-[#2563EB]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1a1a1a]">No listings yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Landlords haven&apos;t posted any properties yet.
            </p>
            <Link
              href="/dashboard/landlord/listings/new"
              className="mt-4 rounded-full bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              List a Property &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* ───────── Trust Levels ───────── */}
      <section className="bg-gray-100 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-3 text-center text-2xl font-bold text-[#1a1a1a] md:text-3xl">
            Trust Levels
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-sm text-gray-500 md:text-base">
            Every property on PROPATI is assigned a trust tier based on the verification steps completed.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Certified */}
            <div className="rounded-2xl border border-[#2563EB]/30 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB]/10">
                <Star className="h-6 w-6 text-[#2563EB]" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-[#1a1a1a]">Certified</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Highest trust. Fully inspected, identity-verified owner, documents checked, and certified by our team.
              </p>
            </div>

            {/* Inspected */}
            <div className="rounded-2xl border border-[#0e7c6a]/30 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0e7c6a]/10">
                <CheckCircle className="h-6 w-6 text-[#0e7c6a]" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-[#1a1a1a]">Inspected</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Physically inspected by a PROPATI agent. Photos verified on-site, condition confirmed.
              </p>
            </div>

            {/* Verified */}
            <div className="rounded-2xl border border-blue-400/30 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <ShieldCheck className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-[#1a1a1a]">Verified</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Owner identity confirmed via Dojah. Documents uploaded and basic checks passed.
              </p>
            </div>

            {/* Basic */}
            <div className="rounded-2xl border border-yellow-400/30 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-[#1a1a1a]">Basic</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Listing is live but not yet verified. Owner has signed up and posted, verification is pending.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-3 text-center text-2xl font-bold text-[#1a1a1a] md:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mb-10 text-center text-sm text-gray-500 md:text-base">
            Everything you need to know about PROPATI
          </p>

          <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-sm font-semibold text-[#1a1a1a] md:text-base [&::-webkit-details-marker]:hidden">
                What is PROPATI?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
                PROPATI is Nigeria&apos;s most trusted property marketplace. We combine technology with a rigorous 5-layer verification system to ensure every listing is genuine, every landlord is real, and every transaction is safe.
              </p>
            </details>

            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-sm font-semibold text-[#1a1a1a] md:text-base [&::-webkit-details-marker]:hidden">
                How does verification work?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
                Our 5-layer verification includes: document uploads (title deeds, receipts), identity verification via Dojah, live proof (photo/video of the property), physical inspection by our agents, and final certification by the PROPATI team.
              </p>
            </details>

            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-sm font-semibold text-[#1a1a1a] md:text-base [&::-webkit-details-marker]:hidden">
                Is my payment secure?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
                Yes. All payments on PROPATI are escrow-protected via Paystack. Funds are only released to the landlord after you confirm move-in, ensuring you never lose money to fraudulent listings.
              </p>
            </details>

            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-sm font-semibold text-[#1a1a1a] md:text-base [&::-webkit-details-marker]:hidden">
                Can I list my property for free?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
                Yes, listing your property on PROPATI is completely free. Verification is optional but highly recommended &mdash; verified listings receive more views and tenant trust.
              </p>
            </details>

            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-sm font-semibold text-[#1a1a1a] md:text-base [&::-webkit-details-marker]:hidden">
                How do I become a verified agent?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
                Sign up as an agent on PROPATI, complete your identity verification, and get assigned by landlords to manage their listings. Verified agents gain access to premium tools and higher visibility.
              </p>
            </details>

            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-sm font-semibold text-[#1a1a1a] md:text-base [&::-webkit-details-marker]:hidden">
                What areas does PROPATI cover?
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
                PROPATI currently covers Lagos and is actively expanding to Abuja, Port Harcourt, and other major Nigerian cities. Sign up to be notified when we launch in your area.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ───────── CTA Section ───────── */}
      <section className="bg-[#0e7c6a] px-4 py-16 text-center text-white md:py-20">
        <h2 className="mx-auto max-w-xl text-2xl font-bold md:text-3xl lg:text-4xl">
          List your property on PROPATI
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/80 md:text-base">
          Free to list. Get verified. Reach thousands of tenants.
        </p>
        <Link
          href={`/${locale}/sign-up`}
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#0e7c6a] transition-colors hover:bg-white/90 md:text-base"
        >
          Get Started
        </Link>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="bg-[#111] px-4 pt-14 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 pb-10 md:grid-cols-4 md:gap-12">
            {/* Col 1: Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href={`/${locale}`} className="mb-4 inline-block">
                <Image src="/logo-white.svg" alt="PROPATI" width={140} height={32} className="h-8 w-auto" />
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Nigeria&apos;s most trusted property marketplace. Find, rent, buy and sell verified properties with confidence.
              </p>
              <div className="mt-4 flex gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/50">X</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/50">IG</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/50">LI</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/50">FB</span>
              </div>
            </div>

            {/* Col 2: Platform */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Platform</h4>
              <ul className="space-y-2.5">
                <li><Link href={`/${locale}?type=sale`} className="text-sm text-white/60 transition-colors hover:text-white">Buy</Link></li>
                <li><Link href={`/${locale}?type=rent`} className="text-sm text-white/60 transition-colors hover:text-white">Rent</Link></li>
                <li><Link href={`/${locale}?type=short-let`} className="text-sm text-white/60 transition-colors hover:text-white">Short-let</Link></li>
                <li><Link href="/dashboard/landlord/listings/new" className="text-sm text-white/60 transition-colors hover:text-white">List Property</Link></li>
              </ul>
            </div>

            {/* Col 3: Trust */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Trust</h4>
              <ul className="space-y-2.5">
                <li><Link href={`/${locale}/verification`} className="text-sm text-white/60 transition-colors hover:text-white">Verification</Link></li>
                <li><Link href={`/${locale}/escrow`} className="text-sm text-white/60 transition-colors hover:text-white">Escrow</Link></li>
                <li><Link href={`/${locale}/dispute-resolution`} className="text-sm text-white/60 transition-colors hover:text-white">Dispute Resolution</Link></li>
                <li><Link href={`/${locale}/certified`} className="text-sm text-white/60 transition-colors hover:text-white">Certified</Link></li>
              </ul>
            </div>

            {/* Col 4: Company */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Company</h4>
              <ul className="space-y-2.5">
                <li><Link href={`/${locale}/about`} className="text-sm text-white/60 transition-colors hover:text-white">About</Link></li>
                <li><Link href={`/${locale}/careers`} className="text-sm text-white/60 transition-colors hover:text-white">Careers</Link></li>
                <li><Link href={`/${locale}/blog`} className="text-sm text-white/60 transition-colors hover:text-white">Blog</Link></li>
                <li><Link href={`/${locale}/contact`} className="text-sm text-white/60 transition-colors hover:text-white">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-white/40 md:flex-row">
            <p>&copy; 2026 PROPATI. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href={`/${locale}/terms`} className="transition-colors hover:text-white/60">Terms</Link>
              <Link href={`/${locale}/privacy`} className="transition-colors hover:text-white/60">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
