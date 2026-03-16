import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const type = searchParams.get('type')
  const area = searchParams.get('area')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const bedrooms = searchParams.get('bedrooms')
  const q = searchParams.get('q')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)

  const where: any = {
    status: 'active',
  }

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

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: {
          orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
          take: 5,
        },
        owner: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    listings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { auth } = require('@clerk/nextjs/server')
    const { userId: clerkUserId } = auth()
    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true, role: true },
    })

    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (!['landlord', 'agent', 'admin', 'estate_manager'].includes(dbUser.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title, listingType, propertyType, address, area, state,
      price, pricePeriod, cautionDeposit, serviceCharge,
      bedrooms, bathrooms, toilets, sizeSqm, parkingSpaces,
      furnished, description, amenities,
    } = body

    if (!title || !listingType || !propertyType || !address || !area || !price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, listingType, propertyType, address, area, price' },
        { status: 400 }
      )
    }

    const listing = await prisma.listing.create({
      data: {
        ownerId: dbUser.id,
        title,
        listingType,
        propertyType,
        address,
        area,
        state: state ?? 'Lagos',
        price,
        pricePeriod: pricePeriod ?? null,
        cautionDeposit: cautionDeposit ?? null,
        serviceCharge: serviceCharge ?? null,
        bedrooms: bedrooms ?? null,
        bathrooms: bathrooms ?? null,
        toilets: toilets ?? null,
        sizeSqm: sizeSqm ?? null,
        parking_spaces: parkingSpaces ?? 0,
        furnished: furnished ?? false,
        description: description ?? null,
        amenities: amenities ?? [],
        status: 'draft',
      },
    })

    return NextResponse.json({ success: true, listing }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/listings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
