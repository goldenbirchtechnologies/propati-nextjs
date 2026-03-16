import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AlertTriangle } from 'lucide-react'

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
    investigating: 'bg-blue-50 text-blue-700',
    resolved: 'bg-green-50 text-green-700',
    dismissed: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>
      {s}
    </span>
  )
}

function SeverityDots({ severity }: { severity: number | null | undefined }) {
  const s = severity ?? 1
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < s
              ? s >= 4
                ? 'bg-red-500'
                : s >= 2
                  ? 'bg-yellow-400'
                  : 'bg-gray-300'
              : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{s}/5</span>
    </div>
  )
}

export default async function AdminDisputesPage({
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

  const disputes = await prisma.disputes.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      users_disputes_raised_byTousers: {
        select: { fullName: true, email: true },
      },
      users_disputes_againstTousers: {
        select: { fullName: true, email: true },
      },
      agreements: {
        include: {
          listing: {
            select: { title: true },
          },
        },
      },
    },
  })

  const statusCounts = {
    open: disputes.filter((d) => d.status === 'open').length,
    investigating: disputes.filter((d) => d.status === 'investigating').length,
    resolved: disputes.filter((d) => d.status === 'resolved').length,
    dismissed: disputes.filter((d) => d.status === 'dismissed').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Disputes</h1>
        <p className="text-sm text-muted-foreground">{disputes.length} total disputes</p>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800">
          Open: {statusCounts.open}
        </span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Investigating: {statusCounts.investigating}
        </span>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          Resolved: {statusCounts.resolved}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          Dismissed: {statusCounts.dismissed}
        </span>
      </div>

      {disputes.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-2 text-muted-foreground">No disputes found</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Raised By</th>
                  <th className="px-4 py-3">Against</th>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        {d.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{d.users_disputes_raised_byTousers.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.users_disputes_raised_byTousers.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{d.users_disputes_againstTousers.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.users_disputes_againstTousers.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs">
                        {d.agreements?.listing?.title ?? <span className="text-muted-foreground">—</span>}
                      </p>
                    </td>
                    <td className="max-w-[180px] px-4 py-3">
                      <p className="truncate text-xs text-muted-foreground">{d.description}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {d.amount_disputed
                        ? `₦${Number(d.amount_disputed).toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <SeverityDots severity={d.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {d.created_at
                        ? new Date(d.created_at).toLocaleDateString('en-NG', {
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
