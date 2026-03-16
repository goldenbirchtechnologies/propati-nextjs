import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { initializeTransaction } from '@/lib/paystack'
import { computeFees } from '@/lib/fees'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser()
    const body = await request.json()
    const { rentScheduleId } = body

    if (!rentScheduleId) {
      return NextResponse.json({ success: false, error: 'rentScheduleId required' }, { status: 400 })
    }

    const schedule = await prisma.rentSchedule.findUnique({
      where: { id: rentScheduleId },
      include: {
        agreement: {
          include: {
            listing: { select: { id: true, title: true } },
            landlord: { select: { id: true, fullName: true, email: true } },
            tenant: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    })

    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Rent schedule not found' }, { status: 404 })
    }

    if (schedule.agreement.tenantId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    if (schedule.status === 'paid') {
      return NextResponse.json({ success: false, error: 'Already paid' }, { status: 400 })
    }

    const amount = Number(schedule.amount)
    const { platformFee, agentCommission, payeeAmount } = computeFees(
      schedule.agreement.type ?? 'rent',
      amount,
    )

    const reference = `PROP_${crypto.randomBytes(8).toString('hex')}_${Date.now()}`

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        reference,
        listingId: schedule.agreement.listing.id,
        payerId: user.id,
        payeeId: schedule.agreement.landlordId,
        agentId: schedule.agreement.agentId,
        type: 'rent',
        status: 'pending',
        amount,
        platformFee,
        agentCommission,
        payeeAmount,
        description: `Rent payment for ${schedule.agreement.listing.title}`,
        metadata: {
          rentScheduleId: schedule.id,
          agreementId: schedule.agreementId,
          dueDate: schedule.dueDate.toISOString(),
        },
      },
    })

    // Link transaction to rent schedule
    await prisma.rentSchedule.update({
      where: { id: rentScheduleId },
      data: { transactionId: transaction.id },
    })

    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Initialize Paystack transaction
    const paystackResult = await initializeTransaction({
      email: user.email,
      amount: Math.round(amount * 100), // Paystack uses kobo (amount * 100)
      reference,
      callback_url: `${base}/en/tenant/payments?ref=${reference}`,
      metadata: {
        transactionId: transaction.id,
        rentScheduleId: schedule.id,
        tenantName: schedule.agreement.tenant.fullName,
        propertyTitle: schedule.agreement.listing.title,
      },
    })

    // Store Paystack reference
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { paystack_ref: paystackResult.reference },
    })

    return NextResponse.json({
      success: true,
      authorization_url: paystackResult.authorization_url,
      reference: paystackResult.reference,
      access_code: paystackResult.access_code,
    })
  } catch (error: unknown) {
    console.error('Payment initiation error:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    if (message === 'Unauthorized')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ success: false, error: 'Payment initiation failed' }, { status: 500 })
  }
}
