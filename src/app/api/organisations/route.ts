import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('estate_manager')
    const body = await request.json()
    const { name, billingEmail, address, cacNumber } = body

    if (!name || !billingEmail) {
      return NextResponse.json(
        { error: 'Name and billing email are required' },
        { status: 400 },
      )
    }

    // Check if user already owns an org
    const existing = await prisma.organisation.findFirst({
      where: { ownerId: user.id },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'You already have an organisation' },
        { status: 400 },
      )
    }

    const org = await prisma.organisation.create({
      data: {
        name,
        ownerId: user.id,
        billingEmail,
        address: address || null,
        cacNumber: cacNumber || null,
      },
    })

    return NextResponse.json({ success: true, id: org.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    if (message === 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (message.startsWith('Forbidden'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Create org error:', error)
    return NextResponse.json({ error: 'Failed to create organisation' }, { status: 500 })
  }
}
