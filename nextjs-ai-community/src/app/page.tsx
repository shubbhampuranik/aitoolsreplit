import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Users, TrendingUp, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Community Portal - Discover the Best AI Tools & Resources',
  description: 'Join the largest AI community to discover, review, and share the best AI tools, prompts, courses, and models. Find your perfect AI solution today.',
  openGraph: {
    title: 'AI Community Portal - Discover the Best AI Tools & Resources',
    description: 'Join the largest AI community to discover, review, and share the best AI tools, prompts, courses, and models.',
  },
}

// This will be replaced with actual data from your database
const featuredTools = [
  {
    id: '1',
    name: 'ChatGPT',
    description: 'Advanced AI assistant for conversations, writing, and problem-solving',
    category: 'Conversational AI',
    rating: 4.8,
    upvotes: 2543,
    logoUrl: '/placeholder-logo.png'
  },
  {
    id: '2', 
    name: 'Midjourney',
    description: 'AI-powered image generation tool for creative professionals',
    category: 'Image Generation',
    rating: 4.7,
    upvotes: 1987,
    logoUrl: '/placeholder-logo.png'
  },
  {
    id: '3',
    name: 'GitHub Copilot',
    description: 'AI pair programmer that helps you write code faster',
    category: 'Code Generation',
    rating: 4.6,
    upvotes: 1654,
    logoUrl: '/placeholder-logo.png'
  }
]

const stats = [
  { label: 'AI Tools', value: '2,500+', icon: Zap },
  { label: 'Community Members', value: '50k+', icon: Users },
  { label: 'Reviews', value: '25k+', icon: Star },
  { label: 'Monthly Growth', value: '150%', icon: TrendingUp },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Community Portal</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/tools" className="text-gray-700 hover:text-blue-600">Tools</Link>
            <Link href="/prompts" className="text-gray-700 hover:text-blue-600">Prompts</Link>
            <Link href="/courses" className="text-gray-700 hover:text-blue-600">Courses</Link>
            <Button variant="outline">Sign In</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover the Best <span className="text-blue-600">AI Tools</span> for Your Needs
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our community of AI enthusiasts and professionals to find, review, and share 
            the most powerful AI tools, prompts, and resources available today.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/tools">Explore AI Tools</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/submit">Submit a Tool</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured AI Tools</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {featuredTools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <Badge variant="secondary">{tool.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{tool.description}</CardDescription>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{tool.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">{tool.upvotes} upvotes</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button asChild>
              <Link href="/tools">View All Tools</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-semibold">AI Community Portal</span>
              </div>
              <p className="text-gray-400">
                The ultimate destination for AI tools, prompts, and resources.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Discover</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/tools">AI Tools</Link></li>
                <li><Link href="/prompts">AI Prompts</Link></li>
                <li><Link href="/courses">Courses</Link></li>
                <li><Link href="/jobs">Jobs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/reviews">Reviews</Link></li>
                <li><Link href="/discussions">Discussions</Link></li>
                <li><Link href="/submit">Submit Tool</Link></li>
                <li><Link href="/contributors">Contributors</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AI Community Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}