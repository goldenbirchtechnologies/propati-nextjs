import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
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
  // The middleware's auth().protect() ensures only authenticated users reach here.
  // We get the userId from Clerk's session cookie / header.
  let userId: string | null = null
  try {
    const { auth } = require('@clerk/nextjs/server')
    userId = auth().userId
  } catch {
    // If Clerk context isn't available (intl middleware conflict), try the cookie
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('__session')
    if (!sessionCookie) {
      redirect(`/${params.locale}/sign-in`)
    }
    // Can't decode Clerk session without auth() — redirect to sign-in
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
