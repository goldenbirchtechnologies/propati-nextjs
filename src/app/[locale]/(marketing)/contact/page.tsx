'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react'

export default function ContactPage({ params }: { params: { locale: string } }) {
  const locale = params.locale
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    // For now, just simulate a send
    await new Promise((r) => setTimeout(r, 1500))
    setSending(false)
    setSent(true)
    setName('')
    setEmail('')
    setSubject('')
    setMessage('')
    setTimeout(() => setSent(false), 5000)
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors'

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link href={`/${locale}`} className="flex items-center">
            <Image src="/logo.svg" alt="PROPATI" width={140} height={32} className="h-8 w-auto" priority />
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}`} className="text-sm font-medium text-gray-600 hover:text-[#2563EB]">Home</Link>
            <Link href={`/${locale}/about`} className="text-sm font-medium text-gray-600 hover:text-[#2563EB]">About</Link>
            <Link href={`/${locale}/sign-up`} className="rounded-full bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#1d4ed8] px-4 py-16 text-center text-white md:py-20">
        <h1 className="text-3xl font-bold md:text-4xl">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/70 md:text-base">
          Have a question, feedback, or need help? We&apos;d love to hear from you.
        </p>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Whether you&apos;re a tenant looking for help, a landlord with questions about verification,
                or an agent wanting to partner with us — we&apos;re here for you.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10">
                  <Mail className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900">hello@propati.ng</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10">
                  <Phone className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900">+234 800 PROPATI</p>
                  <p className="text-xs text-gray-500">Mon - Fri, 8am - 6pm WAT</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10">
                  <MapPin className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Office</p>
                  <p className="text-sm font-medium text-gray-900">Lagos, Nigeria</p>
                  <p className="text-xs text-gray-500">Available for in-person meetings by appointment</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#f5f3ee] p-5">
              <h3 className="mb-2 text-sm font-bold text-gray-900">Response Time</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                We typically respond within 2-4 hours during business hours. For urgent matters,
                call us directly or use the live chat on your dashboard.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Send us a Message</h2>

              {sent && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-green-800">Message sent!</p>
                    <p className="text-xs text-green-700">We&apos;ll get back to you as soon as possible.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="verification">Verification Question</option>
                    <option value="listing">Listing Issue</option>
                    <option value="payment">Payment / Billing</option>
                    <option value="dispute">Report a Dispute</option>
                    <option value="partnership">Partnership / Agent</option>
                    <option value="bug">Report a Bug</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Tell us how we can help..."
                    required
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111] px-4 py-8 text-center text-xs text-white/40">
        <Link href={`/${locale}`} className="mb-3 inline-block">
          <Image src="/logo-white.svg" alt="PROPATI" width={120} height={28} className="h-7 w-auto" />
        </Link>
        <p>&copy; 2026 PROPATI. All rights reserved.</p>
      </footer>
    </main>
  )
}
