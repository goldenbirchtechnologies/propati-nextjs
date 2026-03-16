import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSignedPDF } from '@/lib/pdf'
import { uploadBuffer } from '@/lib/cloudinary'
import { sendSignedAgreementEmail } from '@/lib/resend'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  // Return basic info for the signing page to validate the token
  return NextResponse.json({ success: true, message: 'Use POST to submit signature' })
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const ip        = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'
    const body      = await request.json()
    const { agreementId, role, signerName, consent, identity } = body

    // Validate inputs
    if (!consent)           return NextResponse.json({ success: false, error: 'Consent required' }, { status: 400 })
    if (!signerName?.trim()) return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 })
    if (!identity?.verifiedName) return NextResponse.json({ success: false, error: 'Identity verification required before signing' }, { status: 400 })

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: {
        landlord: true, tenant: true,
        listing: { select: { title: true, address: true } },
      },
    })

    if (!agreement) return NextResponse.json({ success: false, error: 'Agreement not found' }, { status: 404 })

    // Verify token matches the correct party
    const tokenHash    = role === 'landlord' ? agreement.landlordTokenHash    : agreement.tenantTokenHash
    const tokenExpires = role === 'landlord' ? agreement.landlordTokenExpires : agreement.tenantTokenExpires

    if (!tokenHash || !tokenExpires || new Date() > tokenExpires)
      return NextResponse.json({ success: false, error: 'Signing link has expired' }, { status: 400 })

    const tokenValid = await bcrypt.compare(params.token, tokenHash)
    if (!tokenValid)
      return NextResponse.json({ success: false, error: 'Invalid signing link' }, { status: 400 })

    // Check not already signed
    const alreadySigned = role === 'landlord' ? !!agreement.landlordSignedAt : !!agreement.tenantSignedAt
    if (alreadySigned)
      return NextResponse.json({ success: false, error: 'Already signed' }, { status: 400 })

    const now      = new Date()
    const checksum = crypto
      .createHash('sha256')
      .update(`${agreementId}|${role}|${identity.verifiedName}|${identity.idNumberMasked}|${now.toISOString()}`)
      .digest('hex')

    // Record signature with full identity data
    await prisma.agreementSignature.create({
      data: {
        id:          `sig_${crypto.randomBytes(8).toString('hex')}`,
        agreementId,
        signerId:    role === 'landlord' ? agreement.landlordId : agreement.tenantId,
        role,
        ipAddress:   ip,
        userAgent,
        consentText: `I, ${signerName}, have read and agree to the terms of this tenancy agreement. Identity verified via ${identity.idType.toUpperCase()} (${identity.idNumberMasked}). Signed electronically: ${now.toISOString()}.`,
        signedAt:    now,
        checksum,
        idType:             identity.idType,
        idNumberMasked:     identity.idNumberMasked,
        verifiedName:       identity.verifiedName,
        verifiedDob:        identity.verifiedDob,
        dojahRef:           identity.dojahRef,
        identityVerifiedAt: now,
      },
    })

    // Update agreement status
    const bothAlreadySigned = role === 'landlord' ? !!agreement.tenantSignedAt : !!agreement.landlordSignedAt
    const newStatus = bothAlreadySigned
      ? 'fully_signed'
      : role === 'landlord' ? 'landlord_signed' : 'tenant_signed'

    await prisma.agreement.update({
      where: { id: agreementId },
      data: {
        status: newStatus,
        ...(role === 'landlord' ? { landlordSignedAt: now } : { tenantSignedAt: now }),
      },
    })

    // If both parties signed → generate final PDF and email everyone
    if (bothAlreadySigned) {
      const [landlordSig, tenantSig] = await Promise.all([
        prisma.agreementSignature.findFirst({ where: { agreementId, role: 'landlord' } }),
        prisma.agreementSignature.findFirst({ where: { agreementId, role: 'tenant'   } }),
      ])

      const signedPdfBuffer = await generateSignedPDF(
        {
          id:              agreement.id,
          propertyTitle:   agreement.listing.title,
          propertyAddress: agreement.listing.address,
          landlordName:    agreement.landlord.fullName,
          tenantName:      agreement.tenant.fullName,
          startDate:       agreement.startDate?.toLocaleDateString('en-NG') ?? '',
          endDate:         agreement.endDate?.toLocaleDateString('en-NG')   ?? '',
          rentAmount:      Number(agreement.rentAmount),
          rentPeriod:      agreement.rentPeriod ?? 'year',
          cautionDeposit:  agreement.cautionDeposit ? Number(agreement.cautionDeposit) : undefined,
          specialClauses:  agreement.specialClauses ?? undefined,
        },
        {
          landlord: landlordSig ? {
            verifiedName: landlordSig.verifiedName ?? '',
            verifiedDob:  landlordSig.verifiedDob  ?? '',
            idType:       landlordSig.idType        ?? '',
            idNumberMasked: landlordSig.idNumberMasked ?? '',
            signedAt:     landlordSig.signedAt,
            ipAddress:    landlordSig.ipAddress ?? 'unknown',
          } : undefined,
          tenant: tenantSig ? {
            verifiedName: tenantSig.verifiedName ?? '',
            verifiedDob:  tenantSig.verifiedDob  ?? '',
            idType:       tenantSig.idType        ?? '',
            idNumberMasked: tenantSig.idNumberMasked ?? '',
            signedAt:     tenantSig.signedAt,
            ipAddress:    tenantSig.ipAddress ?? 'unknown',
          } : undefined,
        },
        agreement.documentHash ?? ''
      )

      const { secure_url: signedPdfUrl } = await uploadBuffer(signedPdfBuffer, {
        subfolder:     'agreements',
        resource_type: 'raw',
        public_id:     `agreement_${agreementId}_signed`,
      })

      await prisma.agreement.update({ where: { id: agreementId }, data: { signedPdfUrl } })

      await Promise.all([
        sendSignedAgreementEmail({ to: agreement.landlord.email, recipientName: agreement.landlord.fullName, propertyTitle: agreement.listing.title, signedPdfUrl, otherPartyName: agreement.tenant.fullName }),
        sendSignedAgreementEmail({ to: agreement.tenant.email,   recipientName: agreement.tenant.fullName,   propertyTitle: agreement.listing.title, signedPdfUrl, otherPartyName: agreement.landlord.fullName }),
      ])
    }

    return NextResponse.json({
      success: true,
      message: bothAlreadySigned
        ? 'Agreement fully signed. Signed copies emailed to all parties.'
        : 'Signature recorded. Waiting for the other party to sign.',
      status: newStatus,
    })
  } catch (error) {
    console.error('Sign error:', error)
    return NextResponse.json({ success: false, error: 'Signing failed' }, { status: 500 })
  }
}
