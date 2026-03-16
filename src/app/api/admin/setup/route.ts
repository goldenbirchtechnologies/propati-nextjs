import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * One-time admin setup endpoint.
 * Call POST /api/admin/setup with { "secret": "PROPATI_ADMIN_2026" }
 * while signed in with the account you want to make admin.
 *
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

    // Check if there's already an admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { email: true },
    })

    if (existingAdmin) {
      return NextResponse.json({
        error: `An admin already exists (${existingAdmin.email}). Only one admin setup allowed via this endpoint.`,
      }, { status: 409 })
    }

    // Promote to admin
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' },
    })

    return NextResponse.json({
      success: true,
      message: `${user.fullName} (${user.email}) is now an admin. Navigate to /en/admin to access the dashboard. DELETE this setup file after use.`,
    })
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
