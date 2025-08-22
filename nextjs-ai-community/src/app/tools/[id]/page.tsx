import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { tools, categories, reviews, toolCategories } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ExternalLink, Eye, TrendingUp, Users, Calendar, Zap, ChevronLeft } from 'lucide-react'

type Props = {
  params: Promise<{ id: string }>
}

// Generate metadata dynamically for perfect SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const tool = await db
      .select({
        id: tools.id,
        name: tools.name,
        shortDescription: tools.shortDescription,
        description: tools.description,
        logoUrl: tools.logoUrl,
        rating: tools.rating,
        ratingCount: tools.ratingCount,
        category: {
          name: categories.name,
        }
      })
      .from(tools)
      .leftJoin(toolCategories, and(eq(toolCategories.toolId, tools.id), eq(toolCategories.isPrimary, true)))
      .leftJoin(categories, eq(toolCategories.categoryId, categories.id))
      .where(eq(tools.id, id))
      .limit(1);

    if (!tool[0]) {
      return {
        title: 'Tool Not Found',
        description: 'The requested AI tool could not be found.',
      }
    }

    const toolData = tool[0];
    const title = `${toolData.name} - AI Tool Review & Analysis`;
    const description = toolData.shortDescription || `Discover ${toolData.name}, a powerful AI tool in the ${toolData.category?.name || 'AI'} category. Read reviews, compare features, and find the perfect AI solution.`;

    return {
      title,
      description,
      keywords: `${toolData.name}, AI tool, ${toolData.category?.name}, artificial intelligence, ${toolData.name} review, AI software`,
      authors: [{ name: 'AI Community Portal' }],
      openGraph: {
        title,
        description,
        images: toolData.logoUrl ? [{ url: toolData.logoUrl }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: toolData.logoUrl ? [toolData.logoUrl] : [],
      },
      alternates: {
        canonical: `/tools/${id}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'AI Tool Details',
      description: 'Discover detailed information about this AI tool.',
    }
  }
}

// Generate static params for all tools (SSG)
export async function generateStaticParams() {
  try {
    const allTools = await db.select({ id: tools.id }).from(tools).limit(1000);
    return allTools.map((tool) => ({ id: tool.id }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Fetch tool data server-side
async function getTool(id: string) {
  try {
    const tool = await db
      .select({
        id: tools.id,
        name: tools.name,
        shortDescription: tools.shortDescription,
        description: tools.description,
        logoUrl: tools.logoUrl,
        url: tools.url,
        pricingType: tools.pricingType,
        pricingDetails: tools.pricingDetails,
        rating: tools.rating,
        ratingCount: tools.ratingCount,
        upvotes: tools.upvotes,
        views: tools.views,
        featured: tools.featured,
        createdAt: tools.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          color: categories.color,
          icon: categories.icon,
        }
      })
      .from(tools)
      .leftJoin(toolCategories, and(eq(toolCategories.toolId, tools.id), eq(toolCategories.isPrimary, true)))
      .leftJoin(categories, eq(toolCategories.categoryId, categories.id))
      .where(eq(tools.id, id))
      .limit(1);

    return tool[0] || null;
  } catch (error) {
    console.error('Error fetching tool:', error);
    return null;
  }
}

async function getToolReviews(toolId: string) {
  try {
    const toolReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        userId: reviews.userId,
        createdAt: reviews.createdAt,
        helpful: reviews.helpful,
      })
      .from(reviews)
      .where(eq(reviews.toolId, toolId))
      .limit(10);

    return toolReviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export default async function ToolPage({ params }: Props) {
  const { id } = await params;
  const tool = await getTool(id);
  
  if (!tool) {
    notFound();
  }

  const toolReviews = await getToolReviews(id);

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.shortDescription,
    "url": tool.url,
    "image": tool.logoUrl,
    "applicationCategory": "AI Tool",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": tool.pricingType === 'free' ? "0" : null,
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": tool.rating ? Number(tool.rating) : 0,
      "reviewCount": tool.ratingCount,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": toolReviews.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5
      },
      "author": {
        "@type": "Person", 
        "name": "Anonymous"
      },
      "reviewBody": review.content,
      "datePublished": review.createdAt || new Date().toISOString()
    }))
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
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

        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link href="/tools" className="hover:text-blue-600">Tools</Link>
              <span>/</span>
              {tool.category && (
                <>
                  <Link href={`/tools/category/${tool.category.slug}`} className="hover:text-blue-600">
                    {tool.category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-gray-900 font-medium">{tool.name}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tool Header */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {tool.logoUrl ? (
                        <Image
                          src={tool.logoUrl}
                          alt={`${tool.name} logo`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Zap className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
                        {tool.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                        )}
                      </div>
                      <p className="text-lg text-gray-600 mb-4">{tool.shortDescription}</p>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{tool.rating ? Number(tool.rating).toFixed(1) : '0.0'}</span>
                          <span className="text-gray-500">({tool.ratingCount || 0} reviews)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span>{tool.upvotes || 0} upvotes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span>{(tool.views || 0).toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Description */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>About {tool.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>{tool.description || tool.shortDescription}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle>User Reviews ({toolReviews.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {toolReviews.length > 0 ? (
                    <div className="space-y-6">
                      {toolReviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">Anonymous</span>

                          </div>
                          {review.title && (
                            <h4 className="font-medium mb-2">{review.title}</h4>
                          )}
                          <p className="text-gray-700 mb-2">{review.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'No date'}</span>
                            <span>{review.helpful || 0} found helpful</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No reviews yet. Be the first to review {tool.name}!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Action Card */}
              <Card className="mb-6 sticky top-6">
                <CardContent className="p-6">
                  <Button asChild className="w-full mb-4" size="lg">
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit {tool.name}
                    </a>
                  </Button>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Pricing</span>
                      <Badge variant={tool.pricingType === 'free' ? 'default' : 'secondary'}>
                        {tool.pricingType}
                      </Badge>
                    </div>
                    
                    {tool.category && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Category</span>
                        <Link href={`/tools/category/${tool.category.slug}`}>
                          <Badge variant="outline" className="hover:bg-gray-100">
                            {tool.category.name}
                          </Badge>
                        </Link>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Added</span>
                      <span className="text-gray-900">
                        {tool.createdAt ? new Date(tool.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Upvote
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Bookmark
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Related tools will be shown here based on category and user behavior.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}