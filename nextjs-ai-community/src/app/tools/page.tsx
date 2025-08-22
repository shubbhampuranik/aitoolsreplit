import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { tools, categories, toolCategories } from '@/lib/schema'
import { eq, desc, and } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Eye, TrendingUp, Zap, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Tools Directory - Discover the Best AI Tools & Software',
  description: 'Browse our comprehensive directory of AI tools and software. Find the perfect AI solution for your needs with ratings, reviews, and detailed comparisons.',
  keywords: 'AI tools directory, AI software, artificial intelligence tools, AI applications, machine learning tools',
  openGraph: {
    title: 'AI Tools Directory - Discover the Best AI Tools & Software',
    description: 'Browse our comprehensive directory of AI tools and software. Find the perfect AI solution for your needs.',
  },
}

// Fetch tools data server-side
async function getTools() {
  try {
    const toolsData = await db
      .select({
        id: tools.id,
        name: tools.name,
        shortDescription: tools.shortDescription,
        logoUrl: tools.logoUrl,
        url: tools.url,
        pricingType: tools.pricingType,
        rating: tools.rating,
        ratingCount: tools.ratingCount,
        upvotes: tools.upvotes,
        views: tools.views,
        featured: tools.featured,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
        }
      })
      .from(tools)
      .leftJoin(toolCategories, and(eq(toolCategories.toolId, tools.id), eq(toolCategories.isPrimary, true)))
      .leftJoin(categories, eq(toolCategories.categoryId, categories.id))
      .where(eq(tools.status, 'approved'))
      .orderBy(desc(tools.upvotes))
      .limit(50);

    return toolsData;
  } catch (error) {
    console.error('Error fetching tools:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const categoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        color: categories.color,
        icon: categories.icon,
      })
      .from(categories)
      .limit(20);

    return categoriesData;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function ToolsPage() {
  const [toolsData, categoriesData] = await Promise.all([
    getTools(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">AI Community Portal</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/tools" className="text-blue-600 font-medium">Tools</Link>
              <Link href="/prompts" className="text-gray-700 hover:text-blue-600">Prompts</Link>
              <Link href="/courses" className="text-gray-700 hover:text-blue-600">Courses</Link>
              <Button variant="outline">Sign In</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">AI Tools Directory</h1>
          <p className="text-xl mb-8 max-w-2xl">
            Discover the best AI tools and software to enhance your productivity, creativity, and business operations.
          </p>
          <div className="flex items-center bg-white rounded-lg p-2 max-w-md">
            <Search className="h-5 w-5 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder="Search AI tools..."
              className="flex-1 px-4 py-2 text-gray-900 outline-none"
            />
            <Button size="sm">Search</Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categoriesData.map((category) => (
              <Link
                key={category.id}
                href={`/tools/category/${category.slug}`}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full border hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">{category.icon || '🔧'}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">All AI Tools ({toolsData.length})</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="border rounded-lg px-3 py-1 text-sm">
                <option>Most Popular</option>
                <option>Highest Rated</option>
                <option>Recently Added</option>
                <option>Most Viewed</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {toolsData.map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
                        {tool.logoUrl ? (
                          <Image
                            src={tool.logoUrl}
                            alt={`${tool.name} logo`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Zap className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold truncate">
                          {tool.name}
                        </CardTitle>
                        {tool.category && (
                          <Badge 
                            variant="secondary" 
                            className="mt-1 text-xs"
                            style={{ backgroundColor: tool.category.color + '20' }}
                          >
                            {tool.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {tool.shortDescription}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{tool.rating ? Number(tool.rating).toFixed(1) : '0.0'}</span>
                        <span>({tool.ratingCount})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{tool.upvotes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{tool.views}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {tool.pricingType}
                    </Badge>
                    <Link href={`/tools/${tool.id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {toolsData.length === 0 && (
            <div className="text-center py-12">
              <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-600">Database connection needed to display tools.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}