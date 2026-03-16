import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
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

  // Check if we're on the onboarding page
  const headerList = headers()
  const url = headerList.get('x-next-url') ?? headerList.get('x-invoke-path') ?? ''
  const isOnboarding = url.includes('/onboarding')

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, role: true, fullName: true, avatarUrl: true, email: true },
  })

  if (!dbUser) {
    if (!isOnboarding) redirect(`/${params.locale}/onboarding`)
    return <>{children}</>
  }

  if (isOnboarding && dbUser.role) {
    const rolePath = dbUser.role === 'estate_manager' ? 'estate-manager' : dbUser.role
    redirect(`/${params.locale}/${rolePath}`)
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
