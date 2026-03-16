/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // pdfkit → fontkit → restructure needs iconv-lite (native module)
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'iconv-lite': 'commonjs iconv-lite',
      })
    }
    return config
  },
}

module.exports = nextConfig
