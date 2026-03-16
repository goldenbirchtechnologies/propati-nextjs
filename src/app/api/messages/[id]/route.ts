import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireDbUser()

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        landlord: { select: { id: true, fullName: true, avatarUrl: true } },
        tenant:   { select: { id: true, fullName: true, avatarUrl: true } },
        listing:  { select: { id: true, title: true, address: true } },
      },
    })

    if (!conversation)
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })

    if (conversation.landlordId !== user.id && conversation.tenantId !== user.id)
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    // Reset unread count for this user
    const isLandlord = conversation.landlordId === user.id
    await prisma.conversation.update({
      where: { id: params.id },
      data: isLandlord ? { unreadLandlord: 0 } : { unreadTenant: 0 },
    })

    // Mark messages from the other party as read
    await prisma.message.updateMany({
      where: {
        conversationId: params.id,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    })

    return NextResponse.json({ success: true, conversation })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    if (message === 'Unauthorized')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
