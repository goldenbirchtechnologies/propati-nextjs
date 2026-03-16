'use client'

import { useState } from 'react'

interface Props {
  rentScheduleId: string
}

export function PayRentButton({ rentScheduleId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentScheduleId }),
      })

      const data = await res.json()

      if (data.success && data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        setError(data.error ?? 'Payment failed')
        setLoading(false)
      }
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="rounded-lg bg-teal px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
