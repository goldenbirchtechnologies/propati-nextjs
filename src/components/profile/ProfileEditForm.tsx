'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Briefcase,
  Users,
  Shield,
  BadgeCheck,
  MapPin,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { IdentityVerifyBlock } from '@/components/verification/IdentityVerifyBlock'

interface ProfileEditFormProps {
  user: {
    fullName: string
    email: string
    phone: string | null
    profileBio: string | null
    employmentStatus: string | null
    employmentType: string | null
    employerName: string | null
    jobTitle: string | null
    yearlyIncome: string | null
    guarantorName: string | null
    guarantorPhone: string | null
    guarantorRelationship: string | null
    agentBio: string | null
    agentAreas: string[] | null
    ninVerified: boolean | null
    idVerified: boolean | null
    incomeVerified: boolean | null
    profileCompleted: boolean | null
  }
  role: 'tenant' | 'landlord' | 'agent'
  locale: string
}

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Select status' },
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
]

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'Select type' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
]

const GUARANTOR_RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Select relationship' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'friend', label: 'Friend' },
  { value: 'employer', label: 'Employer' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other', label: 'Other' },
]

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors'
const labelClass = 'block text-xs font-semibold text-gray-500 mb-1.5'

export function ProfileEditForm({ user, role, locale }: ProfileEditFormProps) {
  const router = useRouter()

  // Personal info
  const [fullName, setFullName] = useState(user.fullName)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [profileBio, setProfileBio] = useState(user.profileBio ?? '')

  // Employment (tenant)
  const [employmentStatus, setEmploymentStatus] = useState(user.employmentStatus ?? '')
  const [employmentType, setEmploymentType] = useState(user.employmentType ?? '')
  const [employerName, setEmployerName] = useState(user.employerName ?? '')
  const [jobTitle, setJobTitle] = useState(user.jobTitle ?? '')
  const [yearlyIncome, setYearlyIncome] = useState(user.yearlyIncome ?? '')

  // Guarantor (tenant)
  const [guarantorName, setGuarantorName] = useState(user.guarantorName ?? '')
  const [guarantorPhone, setGuarantorPhone] = useState(user.guarantorPhone ?? '')
  const [guarantorRelationship, setGuarantorRelationship] = useState(user.guarantorRelationship ?? '')

  // Agent
  const [agentBio, setAgentBio] = useState(user.agentBio ?? '')
  const [agentAreas, setAgentAreas] = useState(user.agentAreas?.join(', ') ?? '')

  // Verification
  const [showVerify, setShowVerify] = useState(false)

  // Save state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')

    const body: Record<string, unknown> = {
      fullName,
      phone: phone || null,
      profileBio: profileBio || null,
    }

    if (role === 'tenant') {
      body.employmentStatus = employmentStatus || null
      body.employmentType = employmentType || null
      body.employerName = employerName || null
      body.jobTitle = jobTitle || null
      body.yearlyIncome = yearlyIncome || null
      body.guarantorName = guarantorName || null
      body.guarantorPhone = guarantorPhone || null
      body.guarantorRelationship = guarantorRelationship || null
    }

    if (role === 'agent') {
      body.agentBio = agentBio || null
      body.agentAreas = agentAreas
        ? agentAreas.split(',').map((a) => a.trim()).filter(Boolean)
        : null
    }

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to save profile')
      }

      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const verificationItems = [
    { label: 'NIN Verified', done: user.ninVerified },
    { label: 'ID Verified', done: user.idVerified },
    { label: 'Income Verified', done: user.incomeVerified },
    { label: 'Profile Completed', done: user.profileCompleted },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Personal Info ── */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="flex items-center gap-2 font-semibold text-sm mb-5">
          <User className="h-4 w-4 text-teal-600" />
          Personal Information
        </h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className={labelClass}>Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
            />
            <p className="text-xs text-gray-400 mt-1">Email is managed through your account settings</p>
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="profileBio" className={labelClass}>Bio</label>
            <textarea
              id="profileBio"
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
              rows={3}
              placeholder="Tell landlords a little about yourself..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </div>

      {/* ── Employment (Tenant only) ── */}
      {role === 'tenant' && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="flex items-center gap-2 font-semibold text-sm mb-5">
            <Briefcase className="h-4 w-4 text-teal-600" />
            Employment Details
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="employmentStatus" className={labelClass}>Employment Status</label>
                <select
                  id="employmentStatus"
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  className={inputClass}
                >
                  {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="employmentType" className={labelClass}>Employment Type</label>
                <select
                  id="employmentType"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className={inputClass}
                >
                  {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="employerName" className={labelClass}>Employer Name</label>
                <input
                  id="employerName"
                  type="text"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="Company name"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="jobTitle" className={labelClass}>Job Title</label>
                <input
                  id="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Your role"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="yearlyIncome" className={labelClass}>Yearly Income (NGN)</label>
              <input
                id="yearlyIncome"
                type="text"
                inputMode="numeric"
                value={yearlyIncome}
                onChange={(e) => setYearlyIncome(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 5000000"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Guarantor (Tenant only) ── */}
      {role === 'tenant' && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="flex items-center gap-2 font-semibold text-sm mb-5">
            <Users className="h-4 w-4 text-teal-600" />
            Guarantor Information
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="guarantorName" className={labelClass}>Guarantor Name</label>
                <input
                  id="guarantorName"
                  type="text"
                  value={guarantorName}
                  onChange={(e) => setGuarantorName(e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="guarantorPhone" className={labelClass}>Guarantor Phone</label>
                <input
                  id="guarantorPhone"
                  type="tel"
                  value={guarantorPhone}
                  onChange={(e) => setGuarantorPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="guarantorRelationship" className={labelClass}>Relationship</label>
              <select
                id="guarantorRelationship"
                value={guarantorRelationship}
                onChange={(e) => setGuarantorRelationship(e.target.value)}
                className={inputClass}
              >
                {GUARANTOR_RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Agent Bio & Areas (Agent only) ── */}
      {role === 'agent' && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="flex items-center gap-2 font-semibold text-sm mb-5">
            <Briefcase className="h-4 w-4 text-teal-600" />
            Agent Profile
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="agentBio" className={labelClass}>Agent Bio</label>
              <textarea
                id="agentBio"
                value={agentBio}
                onChange={(e) => setAgentBio(e.target.value)}
                rows={4}
                placeholder="Describe your experience and specializations..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label htmlFor="agentAreas" className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Service Areas
                </span>
              </label>
              <input
                id="agentAreas"
                type="text"
                value={agentAreas}
                onChange={(e) => setAgentAreas(e.target.value)}
                placeholder="Lekki, Victoria Island, Ikoyi"
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">Separate areas with commas</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Identity Verification ── */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="flex items-center gap-2 font-semibold text-sm mb-5">
          <BadgeCheck className="h-4 w-4 text-teal-600" />
          Identity Verification
        </h3>

        <div className="space-y-3">
          {verificationItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{item.label}</span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.done
                    ? 'bg-green-50 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}
              >
                {item.done ? 'Verified' : 'Pending'}
              </span>
            </div>
          ))}
        </div>

        {!showVerify ? (
          <button
            type="button"
            onClick={() => setShowVerify(true)}
            className="mt-4 w-full rounded-lg border border-teal-600 py-2.5 text-sm font-semibold text-teal-600 hover:bg-teal-50 transition-colors"
          >
            Verify Now
          </button>
        ) : (
          <div className="mt-4">
            <IdentityVerifyBlock
              compact
              onVerified={() => {
                setShowVerify(false)
                router.refresh()
              }}
              onReset={() => setShowVerify(false)}
            />
          </div>
        )}
      </div>

      {/* ── Sticky Save Bar ── */}
      <div className="sticky bottom-0 z-10 -mx-4 px-4 pb-4 pt-3 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
        <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            {error && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600 font-medium">{error}</span>
              </>
            )}
            {saved && !error && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">Profile saved</span>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
