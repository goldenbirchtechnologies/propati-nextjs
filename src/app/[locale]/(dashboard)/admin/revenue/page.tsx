import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CreditCard, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

function formatCurrency(val: number) {
  return `₦${val.toLocaleString()}`
}

const TYPE_COLORS: Record<string, string> = {
  rent: 'bg-teal-50 text-teal-800',
  caution_deposit: 'bg-blue-50 text-blue-800',
  service_charge: 'bg-purple-50 text-purple-800',
  agent_commission: 'bg-orange-50 text-orange-800',
  subscription: 'bg-yellow-50 text-yellow-800',
}

const STATUS_COLORS: Record<string, string> = {
  released: 'bg-green-50 text-green-700',
  pending: 'bg-yellow-50 text-yellow-800',
  in_escrow: 'bg-blue-50 text-blue-800',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

export default async function AdminRevenuePage({
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

  const [
    releasedStats,
    totalTxCount,
    pendingStats,
    inEscrowStats,
    typeBreakdownRaw,
    recentTransactions,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: { status: 'released' },
      _count: true,
      _sum: { platformFee: true, amount: true },
    }),
    prisma.transaction.count(),
    prisma.transaction.aggregate({
      where: { status: 'pending' },
      _count: true,
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: 'in_escrow' },
      _count: true,
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['type'],
      _count: true,
      _sum: { platformFee: true, amount: true },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        reference: true,
        type: true,
        status: true,
        amount: true,
        platformFee: true,
        createdAt: true,
        users_transactions_payer_idTousers: {
          select: { fullName: true, email: true },
        },
        users_transactions_payee_idTousers: {
          select: { fullName: true },
        },
        listings: {
          select: { title: true, area: true },
        },
      },
    }),
  ])

  const totalRevenue = Number(releasedStats._sum.platformFee ?? 0)
  const totalVolume = Number(releasedStats._sum.amount ?? 0)
  const releasedCount = releasedStats._count
  const pendingVolume = Number(pendingStats._sum.amount ?? 0)
  const escrowVolume = Number(inEscrowStats._sum.amount ?? 0)

  const kpis = [
    {
      label: 'Total Revenue (Platform Fee)',
      value: formatCurrency(totalRevenue),
      sub: `${releasedCount} released transactions`,
      icon: DollarSign,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Total Transaction Volume',
      value: formatCurrency(totalVolume),
      sub: `${totalTxCount} total transactions`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Pending Volume',
      value: formatCurrency(pendingVolume),
      sub: `${pendingStats._count} pending`,
      icon: CreditCard,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'In Escrow',
      value: formatCurrency(escrowVolume),
      sub: `${inEscrowStats._count} in escrow`,
      icon: ArrowUpRight,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Revenue Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform fee and transaction overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="rounded-xl border bg-white p-4">
              <div className={`mb-3 inline-flex rounded-lg p-2 ${kpi.bg}`}>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Revenue by type */}
      {typeBreakdownRaw.length > 0 && (
        <div className="rounded-xl border bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold">Revenue by Transaction Type</h2>
          </div>
          <div className="divide-y">
            {typeBreakdownRaw
              .sort((a, b) => Number(b._sum.platformFee ?? 0) - Number(a._sum.platformFee ?? 0))
              .map((row) => {
                const fee = Number(row._sum.platformFee ?? 0)
                const vol = Number(row._sum.amount ?? 0)
                const pct = totalRevenue > 0 ? (fee / totalRevenue) * 100 : 0
                return (
                  <div key={row.type} className="flex items-center gap-4 px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[row.type] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {row.type}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{row._count} txns</span>
                        <span>{pct.toFixed(1)}% of fees</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-red-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(fee)}</p>
                      <p className="text-xs text-muted-foreground">vol: {formatCurrency(vol)}</p>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="rounded-xl border bg-white">
        <div className="border-b p-4">
          <h2 className="font-semibold">Recent Transactions</h2>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Payer</th>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Platform Fee</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs">{txn.reference}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {txn.users_transactions_payer_idTousers.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {txn.users_transactions_payer_idTousers.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {txn.listings ? (
                        <>
                          <p className="text-xs font-medium">{txn.listings.title}</p>
                          <p className="text-xs text-muted-foreground">{txn.listings.area}</p>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[txn.type] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium">
                      {formatCurrency(Number(txn.amount))}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-red-600">
                      {formatCurrency(Number(txn.platformFee))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[txn.status ?? 'pending'] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {txn.createdAt
                        ? new Date(txn.createdAt).toLocaleDateString('en-NG', {
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
        )}
      </div>
    </div>
  )
}
