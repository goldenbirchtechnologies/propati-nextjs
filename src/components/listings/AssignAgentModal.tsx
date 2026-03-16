'use client'

import { useState } from 'react'
import { X, UserPlus, UserMinus, Loader2, Mail } from 'lucide-react'

interface AssignAgentModalProps {
  listingId: string
  currentAgent: { id: string; fullName: string; email: string } | null
  onClose: () => void
  onAssigned: () => void
}

export default function AssignAgentModal({
  listingId,
  currentAgent,
  onClose,
  onAssigned,
}: AssignAgentModalProps) {
  const [agentEmail, setAgentEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!agentEmail.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/listings/${listingId}/assign-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentEmail: agentEmail.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to assign agent')
      }

      setSuccess('Agent assigned successfully')
      setAgentEmail('')
      onAssigned()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/listings/${listingId}/assign-agent`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to remove agent')
      }

      setSuccess('Agent removed successfully')
      onAssigned()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-md rounded-xl border bg-white p-6 shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-4 text-lg font-semibold">Assign Agent</h2>

        {/* Current agent */}
        {currentAgent && (
          <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/50 p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{currentAgent.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {currentAgent.email}
              </p>
            </div>
            <button
              onClick={handleRemove}
              disabled={loading}
              className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserMinus className="h-3.5 w-3.5" />
              )}
              Remove Agent
            </button>
          </div>
        )}

        {/* Assign form */}
        <form onSubmit={handleAssign} className="space-y-3">
          <div>
            <label
              htmlFor="agent-email"
              className="mb-1 block text-sm font-medium"
            >
              Agent Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="agent-email"
                type="email"
                placeholder="agent@example.com"
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !agentEmail.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Search &amp; Assign
          </button>
        </form>

        {/* Feedback messages */}
        {error && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-600">
            {success}
          </p>
        )}
      </div>
    </div>
  )
}
