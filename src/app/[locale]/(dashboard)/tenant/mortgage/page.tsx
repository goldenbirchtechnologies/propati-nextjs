'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, DollarSign, Calendar } from 'lucide-react'

export default function MortgagePage() {
  const [price, setPrice] = useState('')
  const [downPayment, setDownPayment] = useState('20')
  const [rate, setRate] = useState('18')
  const [years, setYears] = useState('20')

  const priceNum = Number(price.replace(/,/g, '')) || 0
  const downPct = Number(downPayment) / 100
  const loanAmount = priceNum * (1 - downPct)
  const monthlyRate = Number(rate) / 100 / 12
  const totalMonths = Number(years) * 12

  let monthlyPayment = 0
  if (loanAmount > 0 && monthlyRate > 0 && totalMonths > 0) {
    monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
  }

  const totalPayment = monthlyPayment * totalMonths
  const totalInterest = totalPayment - loanAmount

  const fmt = (n: number) =>
    n.toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    })

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors'
  const labelClass = 'block text-xs font-semibold text-gray-500 mb-1.5'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mortgage Calculator</h1>
        <p className="text-sm text-gray-500 mt-1">
          Estimate your monthly mortgage payments
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <div className="rounded-xl border bg-white p-6 space-y-5">
          <h2 className="flex items-center gap-2 font-semibold text-sm text-gray-800">
            <Calculator className="h-4 w-4 text-teal-600" />
            Loan Details
          </h2>

          <div>
            <label className={labelClass}>Property Price (NGN)</label>
            <input
              type="text"
              inputMode="numeric"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value.replace(/[^0-9,]/g, ''))
              }
              placeholder="e.g. 50,000,000"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Down Payment (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Interest Rate (%)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Loan Term (Years)</label>
            <select
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className={inputClass}
            >
              {[5, 10, 15, 20, 25, 30].map((y) => (
                <option key={y} value={y}>
                  {y} years
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-gray-400">
            * Nigerian mortgage rates typically range from 15-25% per annum
          </p>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Monthly Payment Card */}
          <div className="rounded-xl bg-teal-600 p-6 text-white">
            <p className="text-sm opacity-80">Estimated Monthly Payment</p>
            <p className="text-3xl font-bold mt-1">
              {priceNum > 0 ? fmt(monthlyPayment) : '---'}
            </p>
            <p className="text-xs opacity-60 mt-2">
              Based on {years}-year term at {rate}% annual rate
            </p>
          </div>

          {/* Breakdown */}
          <div className="rounded-xl border bg-white p-6 space-y-4">
            <h2 className="font-semibold text-sm text-gray-800">Breakdown</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  Loan Amount
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {priceNum > 0 ? fmt(loanAmount) : '---'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  Total Interest
                </div>
                <span className="text-sm font-semibold text-red-600">
                  {priceNum > 0 ? fmt(totalInterest) : '---'}
                </span>
              </div>

              <div className="border-t pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Total Payment
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {priceNum > 0 ? fmt(totalPayment) : '---'}
                </span>
              </div>
            </div>
          </div>

          {/* Down payment */}
          <div className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Down Payment Required</span>
              <span className="text-sm font-bold text-teal-700">
                {priceNum > 0 ? fmt(priceNum * downPct) : '---'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
