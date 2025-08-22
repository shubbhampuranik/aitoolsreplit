import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/', '/auth/'],
    },
    sitemap: 'https://your-domain.com/sitemap.xml', // Replace with your actual domain
  }
}