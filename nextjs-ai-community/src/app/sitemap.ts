import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { tools, categories } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://your-domain.com' // Replace with your actual domain
  
  try {
    // Get all approved tools
    const toolsData = await db
      .select({ id: tools.id, updatedAt: tools.updatedAt })
      .from(tools)
      .where(eq(tools.status, 'approved'));

    // Get all categories
    const categoriesData = await db
      .select({ slug: categories.slug })
      .from(categories);

    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/tools`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/prompts`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/courses`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/jobs`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      },
    ];

    // Generate tool pages
    const toolPages = toolsData.map((tool) => ({
      url: `${baseUrl}/tools/${tool.id}`,
      lastModified: tool.updatedAt ? new Date(tool.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    // Generate category pages
    const categoryPages = categoriesData.map((category) => ({
      url: `${baseUrl}/tools/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...toolPages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return basic sitemap if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}