import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { listingId } = body

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Toggle save — if already saved, unsave it
    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
    })

    if (existing) {
      await prisma.savedListing.delete({ where: { id: existing.id } })
      await prisma.listing.update({
        where: { id: listingId },
        data: { saves_count: { decrement: 1 } },
      })
      return NextResponse.json({ saved: false, message: 'Listing unsaved' })
    }

    await prisma.savedListing.create({
      data: {
        userId: user.id,
        listingId,
      },
    })
    await prisma.listing.update({
      where: { id: listingId },
      data: { saves_count: { increment: 1 } },
    })

    return NextResponse.json({ saved: true, message: 'Listing saved' })
  } catch (error) {
    console.error('Save listing error:', error)
    return NextResponse.json({ error: 'Failed to save listing' }, { status: 500 })
  }
}
