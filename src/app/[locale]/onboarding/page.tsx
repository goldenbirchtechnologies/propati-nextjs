'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Building2, UserCircle, Briefcase, Settings } from 'lucide-react'

const roles = [
  {
    value: 'landlord',
    label: 'Landlord',
    description: 'I own properties and want to list them',
    icon: Building2,
  },
  {
    value: 'tenant',
    label: 'Tenant / Buyer',
    description: 'I\'m looking for a property to rent or buy',
    icon: UserCircle,
  },
  {
    value: 'agent',
    label: 'Property Agent',
    description: 'I help clients find and manage properties',
    icon: Briefcase,
  },
  {
    value: 'estate_manager',
    label: 'Estate Manager',
    description: 'I manage a portfolio of properties or an estate',
    icon: Settings,
  },
]

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) ?? 'en'

  async function handleSubmit() {
    if (!selected) return
    setLoading(true)

    try {
      const res = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selected }),
      })

      if (!res.ok) throw new Error('Failed to save role')

      const rolePath = selected === 'estate_manager' ? 'estate-manager' : selected
      router.push(`/${locale}/${rolePath}`)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f3ee] p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-gold">Welcome to PROPATI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose your role to get started. You can change this later.
          </p>
        </div>

        <div className="space-y-3">
          {roles.map((role) => {
            const Icon = role.icon
            const isSelected = selected === role.value

            return (
              <button
                key={role.value}
                onClick={() => setSelected(role.value)}
                className={`flex w-full items-center gap-4 rounded-xl border-2 bg-white p-4 text-left transition-all ${
                  isSelected
                    ? 'border-gold shadow-md'
                    : 'border-transparent hover:border-gold/30'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-gold text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{role.label}</p>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="w-full rounded-lg bg-gold py-3 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
