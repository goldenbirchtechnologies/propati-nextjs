export const dynamic = 'force-dynamic'

import { ArrowRightLeft, FileText, Shield, Clock } from 'lucide-react'

export default function TitleTransferPage() {
  const steps = [
    {
      icon: FileText,
      title: 'Purchase Agreement',
      description: 'Complete and sign the sale agreement with the property owner.',
    },
    {
      icon: Shield,
      title: 'Verification',
      description: 'Property documents and title are verified by our legal team.',
    },
    {
      icon: ArrowRightLeft,
      title: 'Title Transfer',
      description: 'Title deed is transferred to your name at the land registry.',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Title Transfer</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track the transfer of property ownership to your name
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="font-semibold text-sm text-gray-800 mb-4">How Title Transfer Works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="text-center p-4 rounded-lg bg-gray-50">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-gray-400 mb-1">Step {i + 1}</p>
                <h3 className="font-semibold text-sm text-gray-900">{step.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Empty state */}
      <div className="rounded-xl border bg-white p-12 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">No active transfers</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          When you purchase a property, the title transfer process will appear here.
        </p>
      </div>
    </div>
  )
}
