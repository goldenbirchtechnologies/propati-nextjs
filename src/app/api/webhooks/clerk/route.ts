import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  let event: any
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const eventType = event.type as string

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, phone_numbers, public_metadata } = event.data

    await prisma.user.create({
      data: {
        clerkUserId: id,
        email: email_addresses[0]?.email_address ?? '',
        phone: phone_numbers?.[0]?.phone_number ?? null,
        fullName: `${first_name ?? ''} ${last_name ?? ''}`.trim() || 'User',
        role: (public_metadata?.role as any) ?? 'tenant',
        password: 'clerk_managed', // Placeholder — auth handled by Clerk, not password
      },
    })
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = event.data

    await prisma.user.update({
      where: { clerkUserId: id },
      data: {
        email: email_addresses[0]?.email_address,
        fullName: `${first_name ?? ''} ${last_name ?? ''}`.trim(),
      },
    })
  }

  if (eventType === 'user.deleted') {
    const { id } = event.data
    await prisma.user.delete({
      where: { clerkUserId: id },
    }).catch(() => {
      // User may not exist in DB yet
    })
  }

  return NextResponse.json({ received: true })
}
