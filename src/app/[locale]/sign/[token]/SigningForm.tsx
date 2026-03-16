'use client'
import { useState } from 'react'
import { IdentityVerifyBlock } from '@/components/verification/IdentityVerifyBlock'

interface VerifyResult {
  idType: string; idNumber: string; idNumberMasked: string
  verifiedName: string; verifiedDob: string; dojahRef: string
}

interface Props {
  token: string; agreementId: string
  role: 'landlord' | 'tenant'; defaultName: string
}

export default function SigningForm({ token, agreementId, role, defaultName }: Props) {
  const [step,       setStep]       = useState<'verify' | 'sign'>('verify')
  const [identity,   setIdentity]   = useState<VerifyResult | null>(null)
  const [nameInput,  setNameInput]  = useState('')
  const [consented,  setConsented]  = useState(false)
  const [signing,    setSigning]    = useState(false)
  const [signError,  setSignError]  = useState('')
  const [success,    setSuccess]    = useState(false)

  function handleVerified(result: VerifyResult) {
    setIdentity(result)
    setNameInput(result.verifiedName)
    setStep('sign')
  }

  async function handleSign() {
    if (!nameInput.trim()) { setSignError('Please enter your name'); return }
    if (!consented)        { setSignError('Please accept the agreement terms'); return }
    if (!identity)         { setSignError('Identity verification required'); return }

    setSigning(true); setSignError('')

    const res = await fetch(`/api/sign/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agreementId, role,
        signerName: nameInput.trim(),
        consent: true,
        identity: {
          idType:         identity.idType,
          idNumberMasked: identity.idNumberMasked,
          verifiedName:   identity.verifiedName,
          verifiedDob:    identity.verifiedDob,
          dojahRef:       identity.dojahRef,
        },
      }),
    })

    const data = await res.json()
    setSigning(false)
    if (data.success) setSuccess(true)
    else setSignError(data.error ?? 'Signing failed')
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">&#x2705;</div>
        <div className="font-bold text-green-800 text-lg">Signature Recorded!</div>
        <div className="text-green-700 text-sm mt-1">
          Your signature has been recorded successfully. You will receive an email once the other party has also signed.
        </div>
      </div>
    )
  }

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-lg">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
        step === 'verify' ? 'bg-teal-600 text-white' : 'bg-green-500 text-white'}`}>
        {step === 'sign' ? '\u2713' : '1'}
      </div>
      <div className="flex-1">
        <div className={`text-xs font-bold ${step === 'sign' ? 'text-green-700' : 'text-gray-900'}`}>
          Verify Identity
        </div>
        {step === 'sign' && identity && (
          <div className="text-xs text-green-600">{identity.verifiedName}</div>
        )}
      </div>
      <div className="text-gray-300">&rarr;</div>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
        step === 'sign' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
        2
      </div>
      <div className={`text-xs font-bold ${step === 'sign' ? 'text-gray-900' : 'text-gray-400'}`}>
        Sign Agreement
      </div>
    </div>
  )

  if (step === 'verify') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <StepIndicator />
        <IdentityVerifyBlock onVerified={handleVerified} compact />
      </div>
    )
  }

  // Step 2 — Sign
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <StepIndicator />

      {/* Identity confirmed summary */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
        <div className="text-xs font-bold text-teal-700 mb-1">Signing as</div>
        <div className="text-sm font-bold text-teal-900">{identity?.verifiedName}</div>
        <div className="text-xs text-teal-700 font-mono mt-0.5">
          {identity?.idType.replace('_', ' ').toUpperCase()}: {identity?.idNumberMasked}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm your full name</label>
        <input type="text" value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500" />
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer mb-4">
        <input type="checkbox" checked={consented} onChange={e => setConsented(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600" />
        <span className="text-xs text-gray-600 leading-relaxed">
          I have read and agree to the terms of this tenancy agreement. I understand this constitutes a legally binding electronic signature.
        </span>
      </label>

      {signError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium mb-3">
          {signError}
        </div>
      )}

      <button onClick={handleSign}
        disabled={signing || !nameInput.trim() || !consented}
        className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {signing ? 'Signing...' : 'Sign Agreement'}
      </button>
    </div>
  )
}
