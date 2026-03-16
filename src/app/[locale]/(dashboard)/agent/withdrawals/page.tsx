import { Wallet } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AgentWithdrawalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Withdrawals</h1>
        <p className="text-sm text-muted-foreground">Request withdrawal of your earned commissions</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-20 text-center">
        <div className="mb-4 rounded-full bg-gold/10 p-4">
          <Wallet className="h-8 w-8 text-gold" />
        </div>
        <h3 className="text-lg font-semibold">Coming Soon</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          This feature is under development and will be available soon.
        </p>
      </div>
    </div>
  )
}
