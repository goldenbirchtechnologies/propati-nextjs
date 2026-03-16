import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ success: true, agreement: null })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ success: true })
}
