import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ success: true, team: [] })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ success: true }, { status: 201 })
}
