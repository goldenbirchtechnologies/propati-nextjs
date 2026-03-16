import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDbUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireDbUser()

    const agreement = await prisma.agreement.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        landlordId: true,
        tenantId: true,
        status: true,
        createdAt: true,
        landlordSignedAt: true,
        tenantSignedAt: true,
        draftPdfUrl: true,
        signedPdfUrl: true,
        documentHash: true,
        listing: { select: { title: true } },
        landlord: { select: { fullName: true } },
        tenant: { select: { fullName: true } },
        signatures: {
          orderBy: { signedAt: 'asc' },
          select: {
            id: true,
            role: true,
            signedAt: true,
            ipAddress: true,
            consentText: true,
            checksum: true,
            idType: true,
            idNumberMasked: true,
            verifiedName: true,
            verifiedDob: true,
            identityVerifiedAt: true,
          },
        },
      },
    })

    if (!agreement)
      return NextResponse.json({ success: false, error: 'Agreement not found' }, { status: 404 })

    // Only the parties involved or admin can see the audit trail
    if (agreement.landlordId !== user.id && agreement.tenantId !== user.id && user.role !== 'admin')
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    // Build audit trail events
    const events: Array<{ timestamp: string; event: string; details: string }> = []

    events.push({
      timestamp: agreement.createdAt?.toISOString() ?? '',
      event: 'Agreement Created',
      details: `Agreement drafted for ${agreement.listing.title}`,
    })

    if (agreement.draftPdfUrl) {
      events.push({
        timestamp: agreement.createdAt?.toISOString() ?? '',
        event: 'Sent for Signing',
        details: 'Draft PDF generated and signing links emailed to both parties',
      })
    }

    for (const sig of agreement.signatures) {
      events.push({
        timestamp: sig.signedAt.toISOString(),
        event: `${sig.role.charAt(0).toUpperCase() + sig.role.slice(1)} Signed`,
        details: `Signed by ${sig.verifiedName ?? 'Unknown'} (${sig.idType?.replace('_', ' ').toUpperCase() ?? 'N/A'}: ${sig.idNumberMasked ?? 'N/A'}) from IP ${sig.ipAddress ?? 'unknown'}`,
      })
    }

    if (agreement.signedPdfUrl) {
      events.push({
        timestamp: agreement.tenantSignedAt?.toISOString() ?? agreement.landlordSignedAt?.toISOString() ?? '',
        event: 'Fully Signed',
        details: 'Both parties signed. Signed PDF generated and emailed.',
      })
    }

    return NextResponse.json({
      success: true,
      agreement: {
        id: agreement.id,
        status: agreement.status,
        propertyTitle: agreement.listing.title,
        landlordName: agreement.landlord.fullName,
        tenantName: agreement.tenant.fullName,
        documentHash: agreement.documentHash,
      },
      audit: events,
      signatures: agreement.signatures,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    if (message === 'Unauthorized')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (message === 'Forbidden')
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
