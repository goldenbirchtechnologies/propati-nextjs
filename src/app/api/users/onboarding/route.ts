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

    // Get Clerk user info
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
      // proceed with defaults
    }

    // 1. Try finding by clerkUserId first (webhook may have created the record)
    const existingByClerk = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (existingByClerk) {
      await prisma.user.update({
        where: { clerkUserId: userId },
        data: { role },
      })
      return NextResponse.json({ success: true, role })
    }

    // 2. Check if a user with this email already exists (from old system or orphaned record)
    if (email) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (existingByEmail) {
        // Link the existing email record to this Clerk user
        await prisma.user.update({
          where: { email },
          data: { clerkUserId: userId, role },
        })
        return NextResponse.json({ success: true, role })
      }
    }

    // 3. No existing record — create new user with upsert to handle race conditions
    await prisma.user.upsert({
      where: { clerkUserId: userId },
      update: { role },
      create: {
        clerkUserId: userId,
        email,
        fullName,
        phone,
        role,
        password: 'clerk_managed',
      },
    })

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Onboarding error:', error)
    const msg = error instanceof Error ? error.message : 'Server error'

    if (msg.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Account conflict. Please try again or contact support.' },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
