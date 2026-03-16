import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TenantDashboardClient from '@/components/tenant/TenantDashboardClient'

export const dynamic = 'force-dynamic'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function TenantDashboard({
  params,
}: {
  params: { locale: string }
}) {
  const clerkUserId = await getAuthUserId()
  if (!clerkUserId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      fullName: true,
      profileCompleted: true,
      employmentStatus: true,
      employerName: true,
      guarantorName: true,
    },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const prefix = `/${params.locale}/tenant`

  // Fetch all stats in parallel
  const [
    activeAgreements,
    pendingAgreements,
    unreadMessages,
    openTickets,
    upcomingRent,
    overdueRent,
    currentHome,
  ] = await Promise.all([
    prisma.agreement.count({ where: { tenantId: dbUser.id, status: 'fully_signed' } }),
    prisma.agreement.count({
      where: { tenantId: dbUser.id, status: { in: ['draft', 'pending_tenant', 'pending_landlord'] } },
    }),
    prisma.conversation.aggregate({
      where: { tenantId: dbUser.id },
      _sum: { unreadTenant: true },
    }),
    prisma.maintenanceTicket.count({
      where: { tenantId: dbUser.id, status: { in: ['open', 'assigned', 'in_progress'] } },
    }),
    prisma.rentSchedule.findFirst({
      where: {
        agreement: { tenantId: dbUser.id },
        status: 'upcoming',
      },
      include: {
        agreement: {
          select: { listing: { select: { title: true, area: true } } },
        },
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.rentSchedule.count({
      where: {
        agreement: { tenantId: dbUser.id },
        status: 'overdue',
      },
    }),
    // Get current active agreement for "Current Home" card
    prisma.agreement.findFirst({
      where: { tenantId: dbUser.id, status: 'fully_signed' },
      include: {
        listing: { select: { title: true, area: true, state: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const unread = unreadMessages._sum.unreadTenant ?? 0

  // Missing profile fields
  const missingFields: string[] = []
  if (!dbUser.employmentStatus) missingFields.push('employment details')
  if (!dbUser.guarantorName) missingFields.push('guarantor info')

  return (
    <TenantDashboardClient
      fullName={dbUser.fullName}
      profileCompleted={dbUser.profileCompleted ?? false}
      missingFields={missingFields}
      prefix={prefix}
      locale={params.locale}
      stats={{
        activeAgreements,
        pendingAgreements,
        unreadMessages: unread,
        openTickets,
        overdueRent,
      }}
      currentHome={
        currentHome
          ? { title: currentHome.listing.title, area: `${currentHome.listing.area}, ${currentHome.listing.state}` }
          : null
      }
      nextPayment={
        upcomingRent
          ? {
              amount: Number(upcomingRent.amount),
              dueDate: upcomingRent.dueDate.toISOString(),
              listing: upcomingRent.agreement.listing.title,
            }
          : null
      }
    />
  )
}
