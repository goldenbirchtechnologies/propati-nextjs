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

    // Check if user already exists in DB
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (existingUser) {
      // Update role
      await prisma.user.update({
        where: { clerkUserId: userId },
        data: { role },
      })
    } else {
      // User doesn't exist yet (webhook hasn't fired) — create them
      let email = ''
      let fullName = 'User'
      let phone: string | null = null

      try {
        const clerkUser = await currentUser()
        if (clerkUser) {
          email = clerkUser.emailAddresses?.[0]?.emailAddress ?? ''
          fullName = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || 'User'
          phone = clerkUser.phoneNumbers?.[0]?.phoneNumber ?? null
        }
      } catch {
        // currentUser() may fail — proceed with defaults
      }

      await prisma.user.create({
        data: {
          clerkUserId: userId,
          email,
          fullName,
          phone,
          role,
          password: 'clerk_managed',
        },
      })
    }

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Onboarding error:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
