import { v2 as cloudinary } from 'cloudinary'

let configured = false
function ensureConfig() {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    configured = true
  }
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: { subfolder?: string; resource_type?: 'image' | 'raw' | 'video' } = {}
): Promise<{ secure_url: string; public_id: string }> {
  ensureConfig()
  const { subfolder = 'images', resource_type = 'image' } = options

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `propati/${subfolder}`,
        resource_type,
        quality: 'auto:good',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve({ secure_url: result.secure_url, public_id: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

export async function uploadBuffer(
  buffer: Buffer,
  options: { subfolder?: string; resource_type?: 'image' | 'raw' | 'video'; public_id?: string } = {}
): Promise<{ secure_url: string; public_id: string }> {
  ensureConfig()
  const { subfolder = 'images', resource_type = 'image', public_id } = options

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `propati/${subfolder}`,
        resource_type,
        ...(public_id ? { public_id } : {}),
      },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve({ secure_url: result.secure_url, public_id: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

export { cloudinary }
