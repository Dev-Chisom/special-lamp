/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/reset-password',
        destination: '/auth/reset-password',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
