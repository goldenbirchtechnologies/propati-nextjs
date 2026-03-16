import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { auth } = require('@clerk/nextjs/server')
    const { userId: clerkUserId } = auth()
    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    })
    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })
    }
    if (listing.ownerId !== dbUser.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (!files.length) {
      return NextResponse.json({ success: false, error: 'No images provided' }, { status: 400 })
    }
    if (files.length > 10) {
      return NextResponse.json({ success: false, error: 'Maximum 10 images' }, { status: 400 })
    }

    // Count existing images
    const existingCount = await prisma.listingImage.count({
      where: { listingId: params.id },
    })
    if (existingCount + files.length > 10) {
      return NextResponse.json(
        { success: false, error: `Already have ${existingCount} images. Max is 10.` },
        { status: 400 }
      )
    }

    const images = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // In production, upload to Cloudinary. For now, create a placeholder URL.
      let url = `/placeholder-image-${Date.now()}-${i}.jpg`
      let publicId: string | null = null

      try {
        // Try Cloudinary upload if configured
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const base64 = buffer.toString('base64')
          const dataUri = `data:${file.type};base64,${base64}`

          const cloudinary = require('cloudinary').v2
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          })

          const result = await cloudinary.uploader.upload(dataUri, {
            folder: `propati/listings/${params.id}`,
            resource_type: 'image',
          })
          url = result.secure_url
          publicId = result.public_id
        }
      } catch (err) {
        console.error('Cloudinary upload failed, using placeholder:', err)
      }

      const image = await prisma.listingImage.create({
        data: {
          listingId: params.id,
          url,
          publicId,
          isCover: existingCount === 0 && i === 0,
          sortOrder: existingCount + i,
        },
      })
      images.push(image)
    }

    return NextResponse.json({ success: true, images }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/listings/:id/images error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
