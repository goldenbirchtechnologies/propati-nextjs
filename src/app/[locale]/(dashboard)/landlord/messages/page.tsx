import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MessagingPage from '@/components/messaging/MessagingPage'

export const dynamic = 'force-dynamic'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function LandlordMessages({
  params,
}: {
  params: { locale: string }
}) {
  const clerkUserId = await getAuthUserId()
  if (!clerkUserId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">Conversations with tenants</p>
      </div>
      <MessagingPage currentUserId={dbUser.id} />
    </div>
  )
}
