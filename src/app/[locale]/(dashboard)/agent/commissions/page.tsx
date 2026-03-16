import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CreditCard, Clock, CheckCircle2 } from 'lucide-react'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function AgentCommissions({
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

  const [earnedAgg, pendingAgg, transactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: { agentId: dbUser.id, status: 'released' },
      _sum: { agentCommission: true },
    }),
    prisma.transaction.aggregate({
      where: { agentId: dbUser.id, status: 'in_escrow' },
      _sum: { agentCommission: true },
    }),
    prisma.transaction.findMany({
      where: { agentId: dbUser.id },
      include: {
        listings: { select: { title: true } },
        users_transactions_payer_idTousers: { select: { fullName: true } },
        users_transactions_payee_idTousers: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const totalEarned = Number(earnedAgg._sum.agentCommission ?? 0)
  const totalPending = Number(pendingAgg._sum.agentCommission ?? 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commission Tracker</h1>
        <p className="text-sm text-muted-foreground">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-2xl font-bold text-green-700">
                ₦{totalEarned.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Released commissions</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-blue-700">
                ₦{totalPending.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">In escrow</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No transactions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Commission transactions linked to your deals will appear here
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold">Transaction History</h2>
          </div>
          <div className="divide-y">
            {transactions.map((txn) => {
              const commission = Number(txn.agentCommission ?? 0)
              const isReleased = txn.status === 'released'
              const isEscrow = txn.status === 'in_escrow'

              return (
                <div key={txn.id} className="flex items-center gap-4 p-4">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                      isReleased ? 'bg-green-50' : isEscrow ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <CreditCard
                      className={`h-5 w-5 ${
                        isReleased
                          ? 'text-green-600'
                          : isEscrow
                            ? 'text-blue-600'
                            : 'text-gray-500'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {txn.listings?.title ?? 'No listing'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {txn.users_transactions_payer_idTousers.fullName}
                      <span className="mx-1.5 text-muted-foreground/50">→</span>
                      {txn.users_transactions_payee_idTousers.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{txn.type}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        isReleased
                          ? 'text-green-700'
                          : isEscrow
                            ? 'text-blue-700'
                            : 'text-foreground'
                      }`}
                    >
                      ₦{commission.toLocaleString()}
                    </p>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        isReleased
                          ? 'bg-green-50 text-green-700'
                          : isEscrow
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {txn.status ?? 'pending'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
