import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Receipt } from 'lucide-react'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function TenantReceipts({
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

  const transactions = await prisma.transaction.findMany({
    where: { payerId: dbUser.id },
    include: {
      listings: { select: { title: true } },
      users_transactions_payee_idTousers: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  function statusBadge(status: string) {
    switch (status) {
      case 'released': return 'bg-green-50 text-green-700'
      case 'in_escrow': return 'bg-blue-50 text-blue-700'
      case 'pending': return 'bg-yellow-50 text-yellow-700'
      case 'failed': return 'bg-red-50 text-red-700'
      case 'refunded': return 'bg-purple-50 text-purple-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Receipts</h1>
        <p className="text-sm text-muted-foreground">Your transaction history</p>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-medium">No transactions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Payment receipts will appear here after your first transaction
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold">All Transactions</h2>
          </div>
          <div className="divide-y">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {txn.listings?.title ?? txn.description ?? 'Payment'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    To: {txn.users_transactions_payee_idTousers.fullName} &middot;{' '}
                    <span className="capitalize">{txn.type}</span> &middot;{' '}
                    {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    }) : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₦{Number(txn.amount).toLocaleString()}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(txn.status ?? 'pending')}`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
