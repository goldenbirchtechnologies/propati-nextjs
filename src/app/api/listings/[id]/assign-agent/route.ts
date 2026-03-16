import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId: clerkUserId } = auth()
    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
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
    if (listing.ownerId !== dbUser.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { agentEmail } = await request.json()

    const agent = await prisma.user.findFirst({
      where: { email: agentEmail, role: 'agent' },
      select: { id: true, fullName: true, email: true },
    })
    if (!agent) {
      return NextResponse.json({ success: false, error: 'No agent found with that email' }, { status: 404 })
    }

    if (agent.id === dbUser.id) {
      return NextResponse.json({ success: false, error: 'Cannot assign yourself' }, { status: 400 })
    }

    await prisma.listing.update({
      where: { id: params.id },
      data: { agentId: agent.id },
    })

    return NextResponse.json({ success: true, agent: { id: agent.id, fullName: agent.fullName, email: agent.email } })
  } catch (error: any) {
    console.error('POST /api/listings/:id/assign-agent error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId: clerkUserId } = auth()
    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
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
    if (listing.ownerId !== dbUser.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await prisma.listing.update({
      where: { id: params.id },
      data: { agentId: null },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/listings/:id/assign-agent error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
