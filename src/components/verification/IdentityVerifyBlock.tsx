'use client'
import { useState } from 'react'

type DojahIdType = 'nin' | 'drivers_license' | 'voters_card'

interface VerifyResult {
  idType:        DojahIdType
  idNumber:      string
  idNumberMasked: string
  verifiedName:  string
  verifiedDob:   string
  dojahRef:      string
}

interface Props {
  onVerified: (result: VerifyResult) => void
  onReset?:   () => void
  compact?:   boolean
}

export function IdentityVerifyBlock({ onVerified, onReset, compact = false }: Props) {
  const [idType,      setIdType]      = useState<DojahIdType>('nin')
  const [idNumber,    setIdNumber]    = useState('')
  const [verifying,   setVerifying]   = useState(false)
  const [error,       setError]       = useState('')
  const [result,      setResult]      = useState<VerifyResult | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleVerify() {
    if (!idNumber.trim()) { setError('Please enter your ID number'); return }
    setVerifying(true); setError(''); setShowConfirm(false)

    const res = await fetch('/api/sign/verify-identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idType, idNumber: idNumber.trim() }),
    })
    const data = await res.json()
    setVerifying(false)

    if (!data.success) {
      setError(data.error ?? 'Verification failed')
      return
    }
    setResult(data.result)
    setShowConfirm(true)
  }

  function handleConfirm() {
    if (result) onVerified(result)
  }

  function handleReset() {
    setIdNumber(''); setResult(null); setShowConfirm(false); setError('')
    onReset?.()
  }

  return (
    <div className={compact ? '' : 'bg-white rounded-xl border border-gray-200 p-5'}>
      {!compact && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-xl">
            <span role="img" aria-label="ID">&#x1FAAA;</span>
          </div>
          <div>
            <div className="font-bold text-sm">Verify Your Identity</div>
            <div className="text-xs text-gray-500">Government-issued ID required</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">ID Type</label>
          <select value={idType}
            onChange={e => { setIdType(e.target.value as DojahIdType); setShowConfirm(false); setError('') }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500">
            <option value="nin">National Identification Number (NIN)</option>
            <option value="drivers_license">Driver&apos;s License</option>
            <option value="voters_card">Voter&apos;s Card</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">ID Number</label>
          <input type="text" value={idNumber}
            onChange={e => { setIdNumber(e.target.value); setShowConfirm(false); setError('') }}
            placeholder={idType === 'nin' ? '12345678901' : 'Enter your ID number'}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono tracking-wider focus:outline-none focus:border-teal-500" />
        </div>

        {/* Dojah match result */}
        {showConfirm && result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="font-bold text-green-800 text-sm mb-3">Match Found</div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Full Name</div>
                <div className="font-bold text-gray-900">{result.verifiedName}</div>
              </div>
              {result.verifiedDob && (
                <div>
                  <div className="text-xs text-gray-500">Date of Birth</div>
                  <div className="font-bold text-gray-900">{result.verifiedDob}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-500">ID Number</div>
                <div className="font-bold text-gray-900 font-mono">{result.idNumberMasked}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleConfirm}
                className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg font-bold text-sm hover:bg-teal-700 transition-colors">
                Yes, that&apos;s me
              </button>
              <button onClick={handleReset}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Not me
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {!showConfirm && (
          <button onClick={handleVerify} disabled={verifying || !idNumber.trim()}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors">
            {verifying ? 'Verifying...' : 'Verify Identity'}
          </button>
        )}

        <p className="text-xs text-gray-400 text-center">Your ID number is never stored — only a masked version is recorded.</p>
      </div>
    </div>
  )
}
