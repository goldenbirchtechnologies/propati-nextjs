import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import SigningForm from './SigningForm'

export default async function SigningPage({
  params,
  searchParams,
}: {
  params: { token: string; locale: string }
  searchParams: { role?: string; id?: string }
}) {
  const { role, id } = searchParams

  if (!id || !role || (role !== 'landlord' && role !== 'tenant')) {
    return <ErrorCard message="This signing link is invalid or has expired." />
  }

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: {
      landlord: { select: { fullName: true } },
      tenant:   { select: { fullName: true } },
      listing:  { select: { title: true, address: true } },
    },
  })

  if (!agreement) return <ErrorCard message="This signing link is invalid or has expired." />

  const tokenHash    = role === 'landlord' ? agreement.landlordTokenHash    : agreement.tenantTokenHash
  const tokenExpires = role === 'landlord' ? agreement.landlordTokenExpires : agreement.tenantTokenExpires

  if (!tokenHash || !tokenExpires || new Date() > tokenExpires)
    return <ErrorCard message="This signing link has expired. Please request a new one." />

  const tokenValid = await bcrypt.compare(params.token, tokenHash)
  if (!tokenValid) return <ErrorCard message="This signing link is invalid or has expired." />

  const alreadySigned = role === 'landlord' ? !!agreement.landlordSignedAt : !!agreement.tenantSignedAt
  if (alreadySigned) return <SuccessCard message="You have already signed this agreement." />

  const signer = role === 'landlord' ? agreement.landlord : agreement.tenant

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="text-2xl font-black mb-1">
            <span className="text-amber-600">P</span>ROPATI
          </div>
          <h1 className="text-xl font-bold text-gray-900">Sign Your Agreement</h1>
        </div>

        {/* Agreement summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Property',   agreement.listing.title],
              ['Landlord',   agreement.landlord.fullName],
              ['Tenant',     agreement.tenant.fullName],
              ['Rent',       `\u20A6${Number(agreement.rentAmount ?? 0).toLocaleString('en-NG')}/${agreement.rentPeriod}`],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="text-xs text-gray-500">{label}</div>
                <div className="font-semibold text-gray-900 text-sm">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF link */}
        {agreement.draftPdfUrl && (
          <a href={agreement.draftPdfUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 mb-4 transition-colors">
            Review Draft Agreement (PDF)
          </a>
        )}

        {/* Two-step signing form */}
        <SigningForm
          token={params.token}
          agreementId={id}
          role={role as 'landlord' | 'tenant'}
          defaultName={signer.fullName}
        />

        <p className="text-xs text-gray-400 text-center mt-4">
          Electronic signatures are legally binding under the Nigeria Cybercrimes Act 2015 and Evidence Act 2011.
        </p>
      </div>
    </div>
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-3">&#x26A0;&#xFE0F;</div>
        <div className="font-bold text-gray-900 text-lg">{message}</div>
      </div>
    </div>
  )
}

function SuccessCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-3">&#x2705;</div>
        <div className="font-bold text-green-800 text-lg">{message}</div>
      </div>
    </div>
  )
}
