import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Admin setup endpoint.
 * Call POST /api/admin/setup with { "secret": "PROPATI_ADMIN_2026" }
 * while signed in with the account you want to make admin.
 *
 * If an existing admin exists, they will be demoted to 'tenant'.
 * Delete this file after your admin account is set up.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    }

    const body = await req.json()
    if (body.secret !== 'PROPATI_ADMIN_2026') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, email: true, fullName: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found in database. Complete onboarding first.' }, { status: 404 })
    }

    if (user.role === 'admin') {
      return NextResponse.json({ message: `${user.email} is already an admin.` })
    }

    // Demote any existing admin(s) back to tenant
    await prisma.user.updateMany({
      where: { role: 'admin' },
      data: { role: 'tenant' },
    })

    // Promote current user to admin
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' },
    })

    return NextResponse.json({
      success: true,
      message: `${user.fullName} (${user.email}) is now the admin. Any previous admin has been demoted. Navigate to /en/admin to access the dashboard.`,
    })
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
