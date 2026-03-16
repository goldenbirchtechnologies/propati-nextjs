'use client'

import { cn } from '@/lib/utils'

const tierConfig: Record<string, { label: string; className: string }> = {
  certified: { label: 'Certified', className: 'bg-teal text-white' },
  inspected: { label: 'Inspected', className: 'bg-teal/80 text-white' },
  verified: { label: 'Verified', className: 'bg-gold text-white' },
  basic: { label: 'Basic', className: 'bg-gold/60 text-white' },
  none: { label: '', className: '' },
}

export default function TrustBadge({ tier }: { tier: string }) {
  const config = tierConfig[tier] ?? tierConfig.none
  if (!config.label) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        config.className
      )}
    >
      <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      {config.label}
    </span>
  )
}
