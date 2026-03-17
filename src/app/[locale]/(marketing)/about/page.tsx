import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck, CheckCircle, Users, Building2, Eye, FileText, Headphones } from 'lucide-react'

export default function AboutPage({ params }: { params: { locale: string } }) {
  const locale = params.locale

  const values = [
    {
      icon: ShieldCheck,
      title: 'Trust First',
      description:
        'Every listing goes through our 5-layer verification process. We verify the property, the owner, and the documents before it goes live.',
    },
    {
      icon: Eye,
      title: 'Transparency',
      description:
        'No hidden fees, no surprise charges. What you see is what you get — pricing, terms, and conditions are always upfront.',
    },
    {
      icon: Users,
      title: 'People-Centered',
      description:
        'We build for real Nigerians looking for real homes. Every feature is designed around the actual renting and buying experience in Nigeria.',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description:
        'Our support team is always available to help resolve disputes, answer questions, and guide you through the process.',
    },
  ]

  const verificationSteps = [
    { step: 1, icon: FileText, title: 'Document Upload', desc: 'Landlord uploads title deeds, C of O, or receipts.' },
    { step: 2, icon: ShieldCheck, title: 'Identity Verification', desc: 'Owner identity confirmed via NIN, Driver\'s License, or Voter\'s Card through Dojah.' },
    { step: 3, icon: Eye, title: 'Live Proof', desc: 'Property owner provides live photo/video evidence of the property.' },
    { step: 4, icon: Building2, title: 'Physical Inspection', desc: 'A PROPATI agent visits the property to verify condition and photos.' },
    { step: 5, icon: CheckCircle, title: 'Certification', desc: 'Property receives a trust badge — Certified, Inspected, Verified, or Basic.' },
  ]

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
            <Link href={`/${locale}/contact`} className="text-sm font-medium text-gray-600 hover:text-[#2563EB]">Contact</Link>
            <Link href={`/${locale}/sign-up`} className="rounded-full bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#1d4ed8] px-4 py-20 text-center text-white">
        <p className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-5 py-1.5 text-xs font-medium tracking-wide">
          About PROPATI
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          Building Trust in Nigeria&apos;s Property Market
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/70 md:text-base">
          PROPATI was born out of frustration with the Nigerian property market — fake listings, ghost agents,
          and lost deposits. We&apos;re here to change that.
        </p>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Our Mission</h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-relaxed">
          To make finding, renting, and buying property in Nigeria safe, transparent, and stress-free.
          We combine technology with a rigorous verification system to ensure every listing is genuine,
          every landlord is real, and every transaction is protected.
        </p>
      </section>

      {/* Values */}
      <section className="bg-[#f5f3ee] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 md:text-3xl">Our Values</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const Icon = v.icon
              return (
                <div key={v.title} className="rounded-2xl border bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB]/10">
                    <Icon className="h-6 w-6 text-[#2563EB]" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{v.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5-Layer Verification */}
      <section className="mx-auto max-w-4xl px-4 py-16 md:py-20">
        <h2 className="mb-3 text-center text-2xl font-bold text-gray-900 md:text-3xl">
          Our 5-Layer Verification
        </h2>
        <p className="mb-10 text-center text-sm text-gray-500 md:text-base">
          Every property on PROPATI goes through this process
        </p>

        <div className="space-y-6">
          {verificationSteps.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.step} className="flex items-start gap-4 rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                  {s.step}
                </div>
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-gray-900">
                    <Icon className="h-4 w-4 text-[#2563EB]" />
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Team / Story */}
      <section className="bg-[#0e7c6a] px-4 py-16 text-center text-white md:py-20">
        <h2 className="mx-auto max-w-xl text-2xl font-bold md:text-3xl">
          Built by Nigerians, for Nigerians
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/80 md:text-base">
          We understand the pain of house-hunting in Lagos and across Nigeria. PROPATI is our solution
          to make the process safer and more transparent for everyone.
        </p>
        <Link
          href={`/${locale}/sign-up`}
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#0e7c6a] transition-colors hover:bg-white/90"
        >
          Join PROPATI Today
        </Link>
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
