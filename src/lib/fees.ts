export function computeFees(type: string, amount: number) {
  const rates: Record<string, number> = {
    rent: 0.10,
    sale: amount > 20_000_000 ? 0.01 : 0.02,
    short_let: 0.05,
    commercial: 0.08,
    share: 0.05,
  }

  const agentRate: Record<string, number> = {
    rent: 0.10,
    sale: amount > 20_000_000 ? 0.01 : 0.015,
    short_let: 0.03,
  }

  const platformFee = Math.round(amount * (rates[type] ?? 0.10))
  const agentCommission = Math.round(amount * (agentRate[type] ?? 0))
  const payeeAmount = amount - platformFee

  return { platformFee, agentCommission, payeeAmount }
}
