/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'via.placeholder.com',
      'images.unsplash.com',
      'cdn.openai.com',
      'storage.googleapis.com'
    ],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }
}

module.exports = nextConfig
