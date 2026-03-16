import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Build update data only with fields present in the body
    const data: Record<string, unknown> = {}

    if (body.fullName !== undefined) data.fullName = body.fullName
    if (body.phone !== undefined) data.phone = body.phone
    if (body.profileBio !== undefined) data.profileBio = body.profileBio
    if (body.employmentStatus !== undefined) data.employmentStatus = body.employmentStatus
    if (body.employmentType !== undefined) data.employmentType = body.employmentType
    if (body.employerName !== undefined) data.employerName = body.employerName
    if (body.jobTitle !== undefined) data.jobTitle = body.jobTitle
    if (body.yearlyIncome !== undefined) data.yearlyIncome = BigInt(body.yearlyIncome)
    if (body.guarantorName !== undefined) data.guarantorName = body.guarantorName
    if (body.guarantorPhone !== undefined) data.guarantorPhone = body.guarantorPhone
    if (body.guarantorRelationship !== undefined) data.guarantorRelationship = body.guarantorRelationship
    if (body.agentBio !== undefined) data.agentBio = body.agentBio
    if (body.agentAreas !== undefined) data.agentAreas = body.agentAreas

    // Fetch current user to merge existing values with incoming updates
    const currentDbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        employmentStatus: true,
        employmentType: true,
        employerName: true,
        jobTitle: true,
        yearlyIncome: true,
        guarantorName: true,
        guarantorPhone: true,
        guarantorRelationship: true,
      },
    })

    const merged = {
      employmentStatus: data.employmentStatus ?? currentDbUser?.employmentStatus,
      employmentType: data.employmentType ?? currentDbUser?.employmentType,
      employerName: data.employerName ?? currentDbUser?.employerName,
      jobTitle: data.jobTitle ?? currentDbUser?.jobTitle,
      yearlyIncome: data.yearlyIncome ?? currentDbUser?.yearlyIncome,
      guarantorName: data.guarantorName ?? currentDbUser?.guarantorName,
      guarantorPhone: data.guarantorPhone ?? currentDbUser?.guarantorPhone,
      guarantorRelationship: data.guarantorRelationship ?? currentDbUser?.guarantorRelationship,
    }

    const allEmploymentFilled = Object.values({
      employmentStatus: merged.employmentStatus,
      employmentType: merged.employmentType,
      employerName: merged.employerName,
      jobTitle: merged.jobTitle,
      yearlyIncome: merged.yearlyIncome,
    }).every((v) => v !== null && v !== undefined && v !== '')

    const allGuarantorFilled = Object.values({
      guarantorName: merged.guarantorName,
      guarantorPhone: merged.guarantorPhone,
      guarantorRelationship: merged.guarantorRelationship,
    }).every((v) => v !== null && v !== undefined && v !== '')

    if (allEmploymentFilled && allGuarantorFilled) {
      data.profileCompleted = true
    }

    await prisma.user.update({
      where: { clerkUserId: userId },
      data,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
