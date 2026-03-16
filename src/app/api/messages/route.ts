import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireDbUser()

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { landlordId: user.id },
          { tenantId: user.id },
        ],
        is_archived: false,
      },
      include: {
        landlord: { select: { id: true, fullName: true, avatarUrl: true } },
        tenant:   { select: { id: true, fullName: true, avatarUrl: true } },
        listing:  { select: { id: true, title: true } },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    return NextResponse.json({ success: true, conversations })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    if (message === 'Unauthorized')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser()
    const body = await request.json()
    const { listingId, landlordId, tenantId, subject } = body

    if (!landlordId || !tenantId) {
      return NextResponse.json({ success: false, error: 'landlordId and tenantId required' }, { status: 400 })
    }

    // Ensure the user is one of the parties
    if (user.id !== landlordId && user.id !== tenantId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Idempotent: find existing or create
    let conversation = await prisma.conversation.findFirst({
      where: listingId
        ? { listingId, tenantId }
        : { landlordId, tenantId, listingId: null },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          landlordId,
          tenantId,
          listingId: listingId ?? null,
          subject: subject ?? null,
        },
      })
    }

    return NextResponse.json({ success: true, conversation }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    if (message === 'Unauthorized')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
