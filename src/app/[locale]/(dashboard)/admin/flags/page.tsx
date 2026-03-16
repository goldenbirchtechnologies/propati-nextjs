import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Flag } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = status ?? 'open'
  const map: Record<string, string> = {
    open: 'bg-yellow-50 text-yellow-800',
    reviewed: 'bg-blue-50 text-blue-700',
    dismissed: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>
      {s}
    </span>
  )
}

export default async function AdminFlagsPage({
  params,
}: {
  params: { locale: string }
}) {
  const clerkUserId = await getAuthUserId()
  if (!clerkUserId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)
  if (dbUser.role !== 'admin') redirect(`/${params.locale}/${dbUser.role === 'estate_manager' ? 'estate-manager' : dbUser.role}`)

  const flags = await prisma.listingFlag.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        select: { title: true, area: true },
      },
      users: {
        select: { fullName: true, email: true },
      },
    },
  })

  const statusCounts = {
    open: flags.filter((f) => f.status === 'open').length,
    reviewed: flags.filter((f) => f.status === 'reviewed').length,
    dismissed: flags.filter((f) => f.status === 'dismissed').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Flagged Listings</h1>
        <p className="text-sm text-muted-foreground">{flags.length} total flags</p>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800">
          Open: {statusCounts.open}
        </span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Reviewed: {statusCounts.reviewed}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          Dismissed: {statusCounts.dismissed}
        </span>
      </div>

      {flags.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Flag className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-2 text-muted-foreground">No flagged listings</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Flagged By</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {flags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{flag.listing.title}</p>
                      <p className="text-xs text-muted-foreground">{flag.listing.area}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{flag.users.fullName}</p>
                      <p className="text-xs text-muted-foreground">{flag.users.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        {flag.type}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate text-xs text-muted-foreground">
                        {flag.description ?? '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={flag.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {flag.createdAt
                        ? new Date(flag.createdAt).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
