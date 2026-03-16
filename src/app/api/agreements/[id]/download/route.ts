import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireDbUser } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireDbUser()

    const agreement = await prisma.agreement.findUnique({
      where: { id: params.id },
      select: {
        landlordId: true,
        tenantId: true,
        draftPdfUrl: true,
        signedPdfUrl: true,
      },
    })

    if (!agreement)
      return NextResponse.json({ success: false, error: 'Agreement not found' }, { status: 404 })

    if (agreement.landlordId !== user.id && agreement.tenantId !== user.id && user.role !== 'admin')
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const pdfUrl = agreement.signedPdfUrl ?? agreement.draftPdfUrl
    if (!pdfUrl)
      return NextResponse.json({ success: false, error: 'No PDF available' }, { status: 404 })

    return NextResponse.redirect(pdfUrl)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    if (message === 'Unauthorized')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
