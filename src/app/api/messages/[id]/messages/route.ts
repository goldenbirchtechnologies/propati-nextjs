import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireDbUser()

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      select: { landlordId: true, tenantId: true },
    })

    if (!conversation)
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    if (conversation.landlordId !== user.id && conversation.tenantId !== user.id)
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const since = new URL(request.url).searchParams.get('since')

    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.id,
        ...(since ? { createdAt: { gt: new Date(since) } } : {}),
      },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, messages })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    if (message === 'Unauthorized')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireDbUser()
    const body = await request.json()
    const { content } = body

    if (!content?.trim())
      return NextResponse.json({ success: false, error: 'Message content required' }, { status: 400 })

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      select: { landlordId: true, tenantId: true },
    })

    if (!conversation)
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 })
    if (conversation.landlordId !== user.id && conversation.tenantId !== user.id)
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const now = new Date()
    const isLandlord = conversation.landlordId === user.id

    // Create message and update conversation in a transaction
    const [newMessage] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: params.id,
          senderId: user.id,
          content: content.trim(),
        },
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      }),
      prisma.conversation.update({
        where: { id: params.id },
        data: {
          lastMessage: content.trim().slice(0, 200),
          lastMessageAt: now,
          ...(isLandlord
            ? { unreadTenant: { increment: 1 } }
            : { unreadLandlord: { increment: 1 } }),
        },
      }),
    ])

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    if (message === 'Unauthorized')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
