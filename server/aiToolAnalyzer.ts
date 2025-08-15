import OpenAI from "openai";
import * as cheerio from 'cheerio';
import { z } from 'zod';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Content guidelines schema
const ToolDataSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(100).max(1000),
  shortDescription: z.string().min(50).max(300),
  category: z.string(),
  subcategory: z.string().optional(),
  pricingType: z.enum(['free', 'freemium', 'paid']),
  pricingDetails: z.string().optional(),
  features: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).min(3).max(8),
  pros: z.array(z.string()).min(3).max(5),
  cons: z.array(z.string()).min(3).max(5),
  useCases: z.array(z.string()).min(2).max(6),
  tags: z.array(z.string()).min(3).max(15),
  targetAudience: z.string(),
  logoUrl: z.string().url().optional(),
  screenshots: z.array(z.string().url()).max(5).optional(),
  confidenceScore: z.number().min(0).max(1)
});

export type AIToolData = z.infer<typeof ToolDataSchema>;

interface AnalysisResult {
  success: boolean;
  data?: AIToolData;
  error?: string;
  webContent?: string;
}

export class AIToolAnalyzer {
  private categories = [
    'Content Creation', 'Data Analysis', 'Development', 'Design', 'Marketing',
    'Productivity', 'Communication', 'Education', 'Healthcare', 'Finance',
    'Sales', 'Customer Support', 'HR', 'Legal', 'Research', 'Entertainment'
  ];

  async analyzeToolFromUrl(url: string): Promise<AnalysisResult> {
    try {
      // Step 1: Fetch and parse website content
      const webContent = await this.fetchWebsiteContent(url);
      if (!webContent) {
        return { success: false, error: 'Failed to fetch website content' };
      }

      // Step 2: Extract images (logos, screenshots)
      const images = await this.extractImages(url, webContent);

      // Step 3: Analyze with OpenAI
      const analysis = await this.analyzeWithAI(url, webContent, images);
      
      return {
        success: true,
        data: analysis,
        webContent: webContent.substring(0, 1000) // Return preview
      };

    } catch (error) {
      console.error('AI Tool Analysis Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  private async fetchWebsiteContent(url: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script and style elements
      $('script, style, nav, footer, header, .cookie, .gdpr').remove();

      // Extract meaningful content
      const title = $('title').text().trim();
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      const h1 = $('h1').first().text().trim();
      const h2s = $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 5);
      const paragraphs = $('p').map((_, el) => $(el).text().trim()).get()
        .filter(text => text.length > 50).slice(0, 10);

      // Combine content
      const content = [
        title,
        metaDescription,
        h1,
        ...h2s,
        ...paragraphs
      ].filter(Boolean).join('\n\n');

      return content.length > 100 ? content : null;

    } catch (error) {
      console.error('Error fetching website:', error);
      return null;
    }
  }

  private async extractImages(url: string, htmlContent: string): Promise<{ logos: string[], screenshots: string[] }> {
    try {
      const $ = cheerio.load(htmlContent);
      const baseUrl = new URL(url).origin;
      
      const images: string[] = [];
      
      // Look for potential logos
      $('img[src*="logo"], img[alt*="logo"], .logo img, [class*="logo"] img').each((_, el) => {
        const src = $(el).attr('src');
        if (src) {
          images.push(this.resolveImageUrl(src, baseUrl));
        }
      });

      // Look for favicon
      const favicon = $('link[rel*="icon"]').attr('href');
      if (favicon) {
        images.push(this.resolveImageUrl(favicon, baseUrl));
      }

      // Look for og:image
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) {
        images.push(this.resolveImageUrl(ogImage, baseUrl));
      }

      // Look for screenshots/product images
      const screenshots: string[] = [];
      $('img[src*="screenshot"], img[src*="demo"], img[src*="product"], .screenshot img, .demo img').each((_, el) => {
        const src = $(el).attr('src');
        if (src) {
          screenshots.push(this.resolveImageUrl(src, baseUrl));
        }
      });

      return {
        logos: Array.from(new Set(images)).slice(0, 3),
        screenshots: Array.from(new Set(screenshots)).slice(0, 5)
      };

    } catch (error) {
      console.error('Error extracting images:', error);
      return { logos: [], screenshots: [] };
    }
  }

  private resolveImageUrl(src: string, baseUrl: string): string {
    try {
      return new URL(src, baseUrl).href;
    } catch {
      return src;
    }
  }

  private async analyzeWithAI(url: string, content: string, images: { logos: string[], screenshots: string[] }): Promise<AIToolData> {
    const prompt = this.buildAnalysisPrompt(url, content, images);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: this.getSystemPrompt()
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000
    });

    const result = response.choices[0].message.content;
    if (!result) {
      throw new Error('No response from AI');
    }

    try {
      const parsed = JSON.parse(result);
      return ToolDataSchema.parse(parsed);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Invalid AI response format');
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert AI tool analyst. Your job is to analyze websites and extract comprehensive, accurate information about AI tools and software products.

IMPORTANT GUIDELINES:
- Be objective and unbiased
- Focus on factual information
- Maintain professional tone
- Ensure descriptions are SEO-friendly but natural
- Include relevant keywords organically
- Be specific about features and capabilities
- Provide balanced pros and cons

CONTENT REQUIREMENTS:
- Name: Official tool name (2-100 chars)
- Description: Comprehensive overview (100-1000 chars)
- Short Description: Concise summary (50-300 chars)
- Features: 3-8 key features with clear explanations
- Pros: 3-5 genuine advantages
- Cons: 3-5 honest limitations or drawbacks
- Use Cases: 2-6 specific scenarios where tool excels
- Tags: 3-15 relevant keywords for searchability
- Target Audience: Primary user demographics

CATEGORIES: ${this.categories.join(', ')}

Always respond with valid JSON matching the required schema.`;
  }

  private buildAnalysisPrompt(url: string, content: string, images: { logos: string[], screenshots: string[] }): string {
    return `Please analyze this AI tool/software and provide comprehensive information in JSON format:

URL: ${url}

WEBSITE CONTENT:
${content}

FOUND IMAGES:
Logos: ${images.logos.join(', ') || 'None found'}
Screenshots: ${images.screenshots.join(', ') || 'None found'}

Please provide a detailed analysis including:
1. Tool name and descriptions
2. Category classification
3. Pricing model (analyze content for pricing information)
4. Key features with explanations
5. Pros and cons (be honest and balanced)
6. Use cases and target audience
7. Relevant tags
8. Confidence score (0-1) based on available information quality
9. Best logo URL from the found images (if any)
10. Best screenshot URLs (if any)

Respond with valid JSON only.`;
  }

  async suggestAlternatives(toolFeatures: string[], toolCategory: string, existingTools: Array<{ id: string, name: string, category: string, features?: string[] }>): Promise<Array<{ id: string, name: string, similarity: number }>> {
    const alternatives = existingTools
      .filter(tool => tool.category === toolCategory && tool.features)
      .map(tool => {
        const similarity = this.calculateSimilarity(toolFeatures, tool.features || []);
        return { id: tool.id, name: tool.name, similarity };
      })
      .filter(alt => alt.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return alternatives;
  }

  private calculateSimilarity(features1: string[], features2: string[]): number {
    const set1 = new Set(features1.map(f => f.toLowerCase()));
    const set2 = new Set(features2.map(f => f.toLowerCase()));
    
    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
    const union = new Set([...Array.from(set1), ...Array.from(set2)]);
    
    return intersection.size / union.size;
  }
}

export const aiToolAnalyzer = new AIToolAnalyzer();