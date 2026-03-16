import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const APPLICATION_MESSAGES: Record<string, string> = {
  rent: 'I would like to apply to rent this property. Please let me know the next steps and any requirements.',
  sale: 'I am interested in making an offer on this property. I would like to discuss pricing and terms.',
  'short-let': 'I would like to book this property for a short-let stay. Please share availability and booking details.',
  share: 'I am interested in sharing this property. I would like to learn more about the arrangement and meet current occupants.',
  commercial: 'I am interested in this commercial property. I would like to discuss terms and schedule a viewing.',
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { listingId, listingType } = body

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 })
    }

    // Get the user record
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, fullName: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the listing + owner
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, title: true, ownerId: true, listingType: true },
    })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Can't apply to own listing
    if (listing.ownerId === user.id) {
      return NextResponse.json({ error: 'Cannot apply to your own listing' }, { status: 400 })
    }

    const type = listingType || listing.listingType || 'rent'
    const typeLabel =
      type === 'short-let' ? 'Short-let Booking' :
      type === 'sale' ? 'Purchase Offer' :
      type === 'share' ? 'Share Request' :
      type === 'commercial' ? 'Commercial Enquiry' :
      'Rental Application'

    // Check if conversation already exists for this listing + tenant
    const existing = await prisma.conversation.findUnique({
      where: {
        listingId_tenantId: {
          listingId: listing.id,
          tenantId: user.id,
        },
      },
    })

    if (existing) {
      // Already applied — send another message
      await prisma.message.create({
        data: {
          conversationId: existing.id,
          senderId: user.id,
          content: `[${typeLabel}] ${APPLICATION_MESSAGES[type] || APPLICATION_MESSAGES.rent}`,
          type: 'application',
        },
      })

      await prisma.conversation.update({
        where: { id: existing.id },
        data: {
          lastMessage: `[${typeLabel}] Application submitted`,
          lastMessageAt: new Date(),
          unreadLandlord: { increment: 1 },
        },
      })

      return NextResponse.json({
        success: true,
        conversationId: existing.id,
        message: 'Application submitted',
      })
    }

    // Create new conversation + first message
    const conversation = await prisma.conversation.create({
      data: {
        listingId: listing.id,
        landlordId: listing.ownerId,
        tenantId: user.id,
        subject: `${typeLabel}: ${listing.title}`,
        lastMessage: `[${typeLabel}] Application submitted`,
        lastMessageAt: new Date(),
        unreadLandlord: 1,
        messages: {
          create: {
            senderId: user.id,
            content: `[${typeLabel}] ${APPLICATION_MESSAGES[type] || APPLICATION_MESSAGES.rent}`,
            type: 'application',
          },
        },
      },
    })

    // Create notification for the landlord
    await prisma.notification.create({
      data: {
        userId: listing.ownerId,
        type: 'application',
        title: `New ${typeLabel}`,
        body: `${user.fullName} has submitted a ${typeLabel.toLowerCase()} for "${listing.title}"`,
        data: {
          listingId: listing.id,
          conversationId: conversation.id,
          applicationType: type,
        },
      },
    })

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      message: 'Application submitted successfully',
    })
  } catch (error) {
    console.error('Application error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
