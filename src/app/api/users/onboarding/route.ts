import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VALID_ROLES = ['landlord', 'tenant', 'agent', 'estate_manager']

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Get Clerk user info for creating DB record if needed
    const clerkUser = await currentUser()

    // Upsert: create user if webhook hasn't fired yet, or update if exists
    await prisma.user.upsert({
      where: { clerkUserId: userId },
      update: { role },
      create: {
        clerkUserId: userId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? '',
        fullName: `${clerkUser?.firstName ?? ''} ${clerkUser?.lastName ?? ''}`.trim() || 'User',
        phone: clerkUser?.phoneNumbers?.[0]?.phoneNumber ?? null,
        role,
        password: 'clerk_managed',
      },
    })

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
