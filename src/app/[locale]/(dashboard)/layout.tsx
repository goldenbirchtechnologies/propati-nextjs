import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import DashboardShell from '@/components/layout/DashboardShell'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  let userId: string | null = null
  try {
    const session = auth()
    userId = session.userId
  } catch {
    redirect(`/${params.locale}/sign-in`)
  }

  if (!userId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, role: true, fullName: true, avatarUrl: true, email: true },
  })

  // No user in DB or no role chosen yet — send to onboarding (now outside dashboard group)
  if (!dbUser || !dbUser.role || dbUser.role === 'pending') {
    redirect(`/${params.locale}/onboarding`)
  }

  return (
    <DashboardShell
      role={dbUser.role}
      fullName={dbUser.fullName}
      avatarUrl={dbUser.avatarUrl}
      email={dbUser.email}
      locale={params.locale}
    >
      {children}
    </DashboardShell>
  )
}
