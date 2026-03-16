import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
      owner: { select: { id: true, fullName: true, avatarUrl: true } },
      verification: true,
    },
  })

  if (!listing) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, listing })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    })
    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })
    }
    if (listing.ownerId !== dbUser.id && dbUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title, description, listingType, propertyType, address, area, state,
      price, pricePeriod, cautionDeposit, serviceCharge,
      bedrooms, bathrooms, toilets, sizeSqm, parkingSpaces,
      furnished, amenities, status,
    } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (listingType !== undefined) updateData.listingType = listingType
    if (propertyType !== undefined) updateData.propertyType = propertyType
    if (address !== undefined) updateData.address = address
    if (area !== undefined) updateData.area = area
    if (state !== undefined) updateData.state = state
    if (price !== undefined) updateData.price = price
    if (pricePeriod !== undefined) updateData.pricePeriod = pricePeriod
    if (cautionDeposit !== undefined) updateData.cautionDeposit = cautionDeposit
    if (serviceCharge !== undefined) updateData.serviceCharge = serviceCharge
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms
    if (bathrooms !== undefined) updateData.bathrooms = bathrooms
    if (toilets !== undefined) updateData.toilets = toilets
    if (sizeSqm !== undefined) updateData.sizeSqm = sizeSqm
    if (parkingSpaces !== undefined) updateData.parking_spaces = parkingSpaces
    if (furnished !== undefined) updateData.furnished = furnished
    if (amenities !== undefined) updateData.amenities = amenities
    if (status !== undefined) updateData.status = status

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, listing: updated })
  } catch (error: any) {
    console.error('PATCH /api/listings/:id error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    })
    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })
    }
    if (listing.ownerId !== dbUser.id && dbUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await prisma.listing.update({
      where: { id: params.id },
      data: { status: 'deleted' },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/listings/:id error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
