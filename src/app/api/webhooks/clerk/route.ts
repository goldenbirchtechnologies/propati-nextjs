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

  let event: Record<string, unknown>
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as Record<string, unknown>
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const eventType = event.type as string
  const data = event.data as Record<string, unknown>

  if (eventType === 'user.created') {
    const id = data.id as string
    const emailAddresses = data.email_addresses as Array<{ email_address: string }> | undefined
    const phoneNumbers = data.phone_numbers as Array<{ phone_number: string }> | undefined
    const firstName = data.first_name as string | null
    const lastName = data.last_name as string | null
    const publicMetadata = data.public_metadata as Record<string, unknown> | undefined

    const email = emailAddresses?.[0]?.email_address ?? ''
    const phone = phoneNumbers?.[0]?.phone_number ?? null
    const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'User'
    const role = (publicMetadata?.role as string) || 'pending'

    try {
      // Check if user already exists (onboarding might have created them first)
      const existingByClerk = await prisma.user.findUnique({ where: { clerkUserId: id } })
      if (existingByClerk) {
        // Already created by onboarding — skip
        return NextResponse.json({ received: true })
      }

      // Check if email already exists (link to Clerk)
      if (email) {
        const existingByEmail = await prisma.user.findUnique({ where: { email } })
        if (existingByEmail) {
          await prisma.user.update({
            where: { email },
            data: { clerkUserId: id, fullName },
          })
          return NextResponse.json({ received: true })
        }
      }

      // Create new user
      await prisma.user.create({
        data: {
          clerkUserId: id,
          email,
          phone,
          fullName,
          role,
          password: 'clerk_managed',
        },
      })
    } catch (err) {
      console.error('Webhook user.created error:', err)
      // Don't return 500 — Clerk will retry and cause duplicates
    }
  }

  if (eventType === 'user.updated') {
    const id = data.id as string
    const emailAddresses = data.email_addresses as Array<{ email_address: string }> | undefined
    const firstName = data.first_name as string | null
    const lastName = data.last_name as string | null

    try {
      await prisma.user.update({
        where: { clerkUserId: id },
        data: {
          email: emailAddresses?.[0]?.email_address,
          fullName: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
        },
      })
    } catch (err) {
      console.error('Webhook user.updated error:', err)
    }
  }

  if (eventType === 'user.deleted') {
    const id = data.id as string
    await prisma.user.delete({
      where: { clerkUserId: id },
    }).catch(() => {
      // User may not exist in DB yet
    })
  }

  return NextResponse.json({ received: true })
}
