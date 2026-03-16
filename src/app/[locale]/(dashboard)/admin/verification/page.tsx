import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Shield, CheckCircle, XCircle, Clock, MinusCircle } from 'lucide-react'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const map: Record<string, string> = {
    in_progress: 'bg-yellow-50 text-yellow-800',
    certified: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
    not_started: 'bg-gray-100 text-gray-600',
    pending: 'bg-gray-100 text-gray-600',
    approved: 'bg-green-50 text-green-700',
    failed: 'bg-red-50 text-red-700',
  }
  const s = status ?? 'not_started'
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>
      {s.replace('_', ' ')}
    </span>
  )
}

function LayerDot({ status }: { status: string | null | undefined }) {
  const s = status ?? 'pending'
  if (s === 'approved' || s === 'certified') return <span className="h-3 w-3 rounded-full bg-green-500" title={s} />
  if (s === 'failed' || s === 'rejected') return <span className="h-3 w-3 rounded-full bg-red-500" title={s} />
  if (s === 'in_review' || s === 'in_progress') return <span className="h-3 w-3 rounded-full bg-yellow-400" title={s} />
  return <span className="h-3 w-3 rounded-full bg-gray-200" title={s} />
}

export default async function AdminVerificationPage({
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

  const verifications = await prisma.verification.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      listing: {
        select: { title: true, area: true },
      },
      users_verifications_owner_idTousers: {
        select: { fullName: true, email: true },
      },
    },
  })

  const overallStatusCounts = {
    in_progress: verifications.filter((v) => v.overallStatus === 'in_progress').length,
    certified: verifications.filter((v) => v.overallStatus === 'certified').length,
    rejected: verifications.filter((v) => v.overallStatus === 'rejected').length,
    not_started: verifications.filter((v) => v.overallStatus === 'not_started' || !v.overallStatus).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verification Queue</h1>
        <p className="text-sm text-muted-foreground">
          {verifications.length} total verifications
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800">
          In Progress: {overallStatusCounts.in_progress}
        </span>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          Certified: {overallStatusCounts.certified}
        </span>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
          Rejected: {overallStatusCounts.rejected}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          Not Started: {overallStatusCounts.not_started}
        </span>
      </div>

      {verifications.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Shield className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-2 text-muted-foreground">No verifications found</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Overall Status</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Layer Statuses</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{v.listing.title}</p>
                      <p className="text-xs text-muted-foreground">{v.listing.area}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{v.users_verifications_owner_idTousers.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.users_verifications_owner_idTousers.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.overallStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{ width: `${((v.currentLayer ?? 1) / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Layer {v.currentLayer ?? 1}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {[v.l1Status, v.l2Status, v.l3Status, v.l4Status, v.l5Status].map(
                          (s, i) => (
                            <div key={i} className="flex flex-col items-center gap-0.5">
                              <LayerDot status={s} />
                              <span className="text-[10px] text-muted-foreground">L{i + 1}</span>
                            </div>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {v.created_at
                        ? new Date(v.created_at).toLocaleDateString('en-NG', {
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
