export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text() // RAW — do not use request.json()
    const sig = request.headers.get('x-paystack-signature')

    if (!sig || !process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const expected = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex')

    if (expected !== sig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    if (event.event === 'charge.success') {
      const { reference, amount: amountKobo } = event.data

      // Find the transaction by reference
      const transaction = await prisma.transaction.findUnique({
        where: { reference },
      })

      if (!transaction) {
        console.error(`Transaction not found for reference: ${reference}`)
        return NextResponse.json({ received: true })
      }

      if (transaction.status === 'in_escrow' || transaction.status === 'released') {
        // Already processed — idempotent
        return NextResponse.json({ received: true })
      }

      const now = new Date()
      const escrowRelease = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Update transaction to in_escrow
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'in_escrow',
          paystack_txn_id: String(event.data.id),
          escrow_release_date: escrowRelease,
        },
      })

      // Update rent schedule to paid
      const metadata = transaction.metadata as Record<string, unknown> | null
      const rentScheduleId = metadata?.rentScheduleId as string | undefined

      if (rentScheduleId) {
        await prisma.rentSchedule.update({
          where: { id: rentScheduleId },
          data: {
            status: 'paid',
            paidAt: now,
          },
        })
      }

      // Create notification for landlord
      await prisma.notification.create({
        data: {
          userId: transaction.payeeId,
          type: 'payment_received',
          title: 'Payment Received',
          body: `Rent payment of ₦${(amountKobo / 100).toLocaleString('en-NG')} received. Funds will be released in 7 days.`,
          data: {
            transactionId: transaction.id,
            amount: amountKobo / 100,
          },
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ received: true }) // Always return 200 to Paystack
  }
}
