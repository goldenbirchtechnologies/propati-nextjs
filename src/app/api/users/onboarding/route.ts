import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VALID_ROLES = ['landlord', 'tenant', 'agent', 'estate_manager']

export async function POST(request: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { role } = body

  if (!role || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Update Clerk public metadata
  await clerkClient.users.updateUser(userId, {
    publicMetadata: { role },
  })

  // Update DB user role (user was created by webhook with default 'tenant')
  await prisma.user.updateMany({
    where: { clerkUserId: userId },
    data: { role },
  })

  return NextResponse.json({ success: true, role })
}
