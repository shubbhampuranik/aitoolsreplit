import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AI Community Portal - Discover the Best AI Tools, Prompts & Resources',
    template: '%s | AI Community Portal'
  },
  description: 'Discover and review the best AI tools, prompts, courses, and models. Join our community of AI enthusiasts and professionals to find the perfect AI solutions for your needs.',
  keywords: 'AI tools, artificial intelligence, AI prompts, AI courses, AI models, machine learning, AI community, AI reviews, AI marketplace',
  authors: [{ name: 'AI Community Portal' }],
  creator: 'AI Community Portal',
  publisher: 'AI Community Portal',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    title: 'AI Community Portal - Discover the Best AI Tools, Prompts & Resources',
    description: 'Discover and review the best AI tools, prompts, courses, and models. Join our community of AI enthusiasts and professionals.',
    siteName: 'AI Community Portal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Community Portal - Discover the Best AI Tools, Prompts & Resources',
    description: 'Discover and review the best AI tools, prompts, courses, and models.',
    creator: '@aicommunity',
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}