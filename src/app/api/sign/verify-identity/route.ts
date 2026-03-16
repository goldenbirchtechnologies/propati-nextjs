import { NextRequest, NextResponse } from 'next/server'
import { verifyIdentity, maskId } from '@/lib/dojah'
import type { DojahIdType } from '@/lib/dojah'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { idType, idNumber } = await request.json()

    if (!idNumber?.trim()) {
      return NextResponse.json({ success: false, error: 'ID number required' }, { status: 400 })
    }

    const result = await verifyIdentity(idType as DojahIdType, idNumber.trim())

    return NextResponse.json({
      success: true,
      result: {
        idType,
        idNumber:       idNumber.trim(),
        idNumberMasked: maskId(idNumber.trim()),
        verifiedName:   result.fullName,
        verifiedDob:    result.dob,
        dojahRef:       result.dojahRef,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed. Please check your ID number.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 422 }
    )
  }
}
