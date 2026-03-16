import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateAgreementPDF, hashDocument } from '@/lib/pdf'
import { uploadBuffer } from '@/lib/cloudinary'
import { sendAgreementSigningEmail } from '@/lib/resend'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole('landlord', 'agent', 'admin')

    const agreement = await prisma.agreement.findUnique({
      where: { id: params.id },
      include: {
        landlord: true, tenant: true,
        listing: { select: { title: true, address: true } },
      },
    })

    if (!agreement)
      return NextResponse.json({ success: false, error: 'Agreement not found' }, { status: 404 })
    if (agreement.landlordId !== user.id && user.role !== 'admin')
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    // 1. Generate unsigned PDF
    const pdfBuffer = await generateAgreementPDF({
      id:              agreement.id,
      propertyTitle:   agreement.listing.title,
      propertyAddress: agreement.listing.address,
      landlordName:    agreement.landlord.fullName,
      tenantName:      agreement.tenant.fullName,
      startDate:       agreement.startDate?.toLocaleDateString('en-NG') ?? '',
      endDate:         agreement.endDate?.toLocaleDateString('en-NG') ?? '',
      rentAmount:      Number(agreement.rentAmount),
      rentPeriod:      agreement.rentPeriod ?? 'year',
      cautionDeposit:  agreement.cautionDeposit ? Number(agreement.cautionDeposit) : undefined,
      specialClauses:  agreement.specialClauses ?? undefined,
    })

    const documentHash = hashDocument(pdfBuffer)

    // 2. Upload draft PDF
    const { secure_url: draftPdfUrl } = await uploadBuffer(pdfBuffer, {
      subfolder:     'agreements',
      resource_type: 'raw',
      public_id:     `agreement_${agreement.id}_draft`,
    })

    // 3. Generate signing tokens
    const landlordRawToken = crypto.randomBytes(32).toString('hex')
    const tenantRawToken   = crypto.randomBytes(32).toString('hex')
    const tokenExpiry      = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const [landlordTokenHash, tenantTokenHash] = await Promise.all([
      bcrypt.hash(landlordRawToken, 8),
      bcrypt.hash(tenantRawToken, 8),
    ])

    await prisma.agreement.update({
      where: { id: agreement.id },
      data: {
        status: 'pending_landlord',
        draftPdfUrl,
        documentHash,
        landlordTokenHash,
        tenantTokenHash,
        landlordTokenExpires: tokenExpiry,
        tenantTokenExpires:   tokenExpiry,
      },
    })

    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://propati.ng'

    // 4. Email both parties
    await Promise.all([
      sendAgreementSigningEmail({
        to:            agreement.landlord.email,
        recipientName: agreement.landlord.fullName,
        role:          'landlord',
        propertyTitle: agreement.listing.title,
        signingUrl:    `${base}/sign/${landlordRawToken}?role=landlord&id=${agreement.id}`,
        pdfUrl:        draftPdfUrl,
        otherPartyName: agreement.tenant.fullName,
        rentAmount:    Number(agreement.rentAmount),
        rentPeriod:    agreement.rentPeriod ?? 'year',
      }),
      sendAgreementSigningEmail({
        to:            agreement.tenant.email,
        recipientName: agreement.tenant.fullName,
        role:          'tenant',
        propertyTitle: agreement.listing.title,
        signingUrl:    `${base}/sign/${tenantRawToken}?role=tenant&id=${agreement.id}`,
        pdfUrl:        draftPdfUrl,
        otherPartyName: agreement.landlord.fullName,
        rentAmount:    Number(agreement.rentAmount),
        rentPeriod:    agreement.rentPeriod ?? 'year',
      }),
    ])

    return NextResponse.json({ success: true, message: 'Signing emails sent to both parties', draftPdfUrl })
  } catch (error) {
    console.error('Send for signing error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send for signing' }, { status: 500 })
  }
}
