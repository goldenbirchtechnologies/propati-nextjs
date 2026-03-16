'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Building2 } from 'lucide-react'

export default function CreateOrg() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [name, setName] = useState('')
  const [billingEmail, setBillingEmail] = useState('')
  const [address, setAddress] = useState('')
  const [cacNumber, setCacNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !billingEmail.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/organisations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          billingEmail: billingEmail.trim(),
          address: address.trim() || undefined,
          cacNumber: cacNumber.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create organisation')
      }

      router.push(`/${locale}/estate-manager`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Organisation</h1>
        <p className="text-sm text-muted-foreground">
          Set up your property management organisation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-50 p-4">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Organisation Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. Lekki Properties Ltd"
          />
        </div>

        <div>
          <label htmlFor="billingEmail" className="block text-sm font-medium">
            Billing Email <span className="text-red-500">*</span>
          </label>
          <input
            id="billingEmail"
            type="email"
            required
            value={billingEmail}
            onChange={(e) => setBillingEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="billing@company.com"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium">
            Office Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="123 Victoria Island, Lagos"
          />
        </div>

        <div>
          <label htmlFor="cacNumber" className="block text-sm font-medium">
            CAC Registration Number
          </label>
          <input
            id="cacNumber"
            type="text"
            value={cacNumber}
            onChange={(e) => setCacNumber(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="RC-123456"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Corporate Affairs Commission registration number (optional)
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim() || !billingEmail.trim()}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Organisation'}
        </button>
      </form>
    </div>
  )
}
