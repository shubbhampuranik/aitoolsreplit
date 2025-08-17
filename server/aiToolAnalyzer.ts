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
  subcategory: z.string().optional().nullable(),
  pricingType: z.enum(['free', 'freemium', 'paid']),
  pricingDetails: z.string().optional().nullable(),
  features: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).min(5).max(8),
  pros: z.array(z.string()).min(4).max(6),
  cons: z.array(z.string()).min(3).max(5),
  useCases: z.array(z.string()).min(3).max(6),
  qaItems: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).min(4).max(8),
  tags: z.array(z.string()).min(3).max(15),
  targetAudience: z.string(),
  logoUrl: z.string().url().optional().nullable(),
  screenshots: z.array(z.string().url()).max(5).optional().nullable(),
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
  private openai: OpenAI;
  private defaultCategories = [
    'Content Creation', 'Data Analysis', 'Development', 'Design', 'Marketing',
    'Productivity', 'Communication', 'Education', 'Healthcare', 'Finance',
    'Sales', 'Customer Support', 'HR', 'Legal', 'Research', 'Entertainment'
  ];

  private async getAvailableCategories(): Promise<string[]> {
    try {
      // Import storage dynamically to avoid circular imports
      const { storage } = await import('./storage');
      const categories = await storage.getCategories();
      const categoryNames = categories.map(cat => cat.name);
      
      // Merge with default categories to ensure we have a good set
      const uniqueCategories = new Set([...categoryNames, ...this.defaultCategories]);
      return Array.from(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return this.defaultCategories;
    }
  }

  private getCategoryFromUrl(url: string): string {
    const domain = url.toLowerCase();
    
    // Development tools
    if (domain.includes('bolt.new') || domain.includes('github') || domain.includes('code') || 
        domain.includes('dev') || domain.includes('programming') || domain.includes('api')) {
      return 'Development';
    }
    
    // Design tools
    if (domain.includes('figma') || domain.includes('canva') || domain.includes('design') ||
        domain.includes('logo') || domain.includes('graphic')) {
      return 'Design';
    }
    
    // Content creation
    if (domain.includes('write') || domain.includes('content') || domain.includes('copy') ||
        domain.includes('blog') || domain.includes('article')) {
      return 'Content Creation';
    }
    
    // Marketing tools
    if (domain.includes('marketing') || domain.includes('seo') || domain.includes('ads') ||
        domain.includes('campaign') || domain.includes('social')) {
      return 'Marketing';
    }
    
    // Communication tools
    if (domain.includes('chat') || domain.includes('meet') || domain.includes('call') ||
        domain.includes('video') || domain.includes('conference')) {
      return 'Communication';
    }
    
    // Default to Productivity for AI tools
    return 'Productivity';
  }

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async analyzeToolFromUrl(url: string): Promise<AnalysisResult> {
    try {
      console.log('Starting AI analysis for URL:', url);
      
      // Step 1: Fetch and parse website content
      const webContent = await this.fetchWebsiteContent(url);
      if (!webContent) {
        // If we can't fetch content, generate basic analysis from URL alone
        console.log('Website content fetch failed, generating analysis from URL only');
        const basicAnalysis = await this.generateBasicAnalysisFromUrl(url);
        return {
          success: true,
          data: basicAnalysis,
          webContent: `Analysis generated from URL: ${url} (content fetch failed)`
        };
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
      
      // Fallback: Try to generate basic analysis from URL if all else fails
      try {
        console.log('Attempting fallback basic analysis from URL');
        const basicAnalysis = await this.generateBasicAnalysisFromUrl(url);
        return {
          success: true,
          data: basicAnalysis,
          webContent: `Fallback analysis from URL: ${url}`
        };
      } catch (fallbackError) {
        console.error('Fallback analysis also failed:', fallbackError);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    }
  }

  private async fetchWebsiteContent(url: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      // Try multiple user agents to bypass basic blocking
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];
      
      for (const userAgent of userAgents) {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': userAgent,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'DNT': '1',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'none',
              'Cache-Control': 'max-age=0'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            console.log(`HTTP ${response.status} with user agent: ${userAgent.substring(0, 50)}...`);
            if (userAgent === userAgents[userAgents.length - 1]) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            continue; // Try next user agent
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
        } catch (fetchError) {
          console.log(`Failed with user agent ${userAgent.substring(0, 50)}...: ${fetchError}`);
          if (userAgent === userAgents[userAgents.length - 1]) {
            throw fetchError;
          }
          continue; // Try next user agent
        }
      }
      
      return null; // All user agents failed
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
    const [prompt, systemPrompt] = await Promise.all([
      this.buildAnalysisPrompt(url, content, images),
      this.getSystemPrompt()
    ]);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: systemPrompt
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
      console.log('Parsed AI response:', JSON.stringify(parsed, null, 2));
      
      const validatedData = ToolDataSchema.parse(parsed);
      console.log('Schema validation successful');
      return validatedData;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw AI response:', result);
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.issues);
      }
      throw new Error('Invalid AI response format');
    }
  }

  private async getSystemPrompt(): Promise<string> {
    const availableCategories = await this.getAvailableCategories();
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

CATEGORIES: ${availableCategories.join(', ')}

Always respond with valid JSON matching the required schema.`;
  }

  private async buildAnalysisPrompt(url: string, content: string, images: { logos: string[], screenshots: string[] }): Promise<string> {
    const availableCategories = await this.getAvailableCategories();
    return `Please analyze this AI tool/software and provide comprehensive information in the exact JSON format specified below:

URL: ${url}

WEBSITE CONTENT:
${content}

FOUND IMAGES:
Logos: ${images.logos.join(', ') || 'None found'}
Screenshots: ${images.screenshots.join(', ') || 'None found'}

REQUIRED JSON FORMAT (follow this structure exactly):
{
  "name": "Tool Name (2-100 chars)",
  "description": "Comprehensive overview (100-1000 chars)",
  "shortDescription": "Concise summary (50-300 chars)",
  "category": "Primary category from: ${availableCategories.join(', ')}",
  "subcategory": "Optional subcategory",
  "pricingType": "free, freemium, or paid",
  "pricingDetails": "Optional pricing details",
  "features": [
    {"title": "Feature 1", "description": "Detailed feature description"},
    {"title": "Feature 2", "description": "Detailed feature description"},
    {"title": "Feature 3", "description": "Detailed feature description"},
    {"title": "Feature 4", "description": "Detailed feature description"},
    {"title": "Feature 5", "description": "Detailed feature description"}
  ],
  "pros": ["Advantage 1", "Advantage 2", "Advantage 3", "Advantage 4"],
  "cons": ["Limitation 1", "Limitation 2", "Limitation 3"],
  "useCases": ["Use case 1", "Use case 2", "Use case 3"],
  "qaItems": [
    {"question": "Question 1", "answer": "Detailed answer 1"},
    {"question": "Question 2", "answer": "Detailed answer 2"},
    {"question": "Question 3", "answer": "Detailed answer 3"},
    {"question": "Question 4", "answer": "Detailed answer 4"}
  ],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "targetAudience": "Primary user demographics",
  "logoUrl": "Best logo URL if available",
  "screenshots": ["screenshot1.jpg", "screenshot2.jpg"],
  "confidenceScore": 0.8
}

IMPORTANT: 
- Use only the exact field names shown above
- Features must be objects with "title" and "description" fields
- Pros/cons/useCases/tags must be arrays of strings
- PricingType must be exactly "free", "freemium", or "paid"
- ConfidenceScore must be a number between 0 and 1
- Category must match one from the provided list
- For optional fields (subcategory, pricingDetails, logoUrl, screenshots): use null if not available
- Only include valid URLs in logoUrl and screenshots arrays

Respond with valid JSON only, no markdown or explanations.`;
  }

  private async generateBasicAnalysisFromUrl(url: string): Promise<AIToolData> {
    try {
      // Extract basic info from URL
      const urlParts = url.split('/');
      const domain = urlParts[2] || '';
      const toolName = domain.split('.')[0] || 'Unknown Tool';
      
      // Get suggested category from URL
      const suggestedCategory = this.getCategoryFromUrl(url);
      
      // Generate a comprehensive analysis using AI with just the URL
      const prompt = `Analyze this tool based on its URL: ${url}

If you recognize this specific tool, provide accurate detailed information. Otherwise, make intelligent inferences based on the domain name and URL structure.

For tools like bolt.new (development), quillbot.com (writing), figma.com (design), etc., be specific about their actual capabilities and features.

Generate comprehensive content including 5-8 features, 4-6 pros, 3-5 cons, 3-6 use cases, and 4-8 Q&A pairs.

Respond with valid JSON only in this exact format:
{
  "name": "Actual Tool Name",
  "description": "Comprehensive description of what this tool actually does (200-1000 chars)",
  "shortDescription": "Concise accurate summary (50-300 chars)",
  "category": "${suggestedCategory}",
  "subcategory": "Specific subcategory if applicable",
  "pricingType": "free|freemium|paid",
  "pricingDetails": "Specific pricing information if known",
  "features": [
    {"title": "Feature 1", "description": "Detailed description"},
    {"title": "Feature 2", "description": "Detailed description"},
    {"title": "Feature 3", "description": "Detailed description"},
    {"title": "Feature 4", "description": "Detailed description"},
    {"title": "Feature 5", "description": "Detailed description"}
  ],
  "pros": ["Specific advantage 1", "Specific advantage 2", "Specific advantage 3", "Specific advantage 4"],
  "cons": ["Realistic limitation 1", "Realistic limitation 2", "Realistic limitation 3"],
  "useCases": ["Specific use case 1", "Specific use case 2", "Specific use case 3"],
  "qaItems": [
    {"question": "What does this tool do?", "answer": "Detailed answer about functionality"},
    {"question": "How much does it cost?", "answer": "Pricing information"},
    {"question": "Who is it for?", "answer": "Target audience description"},
    {"question": "What are the main benefits?", "answer": "Key advantages"}
  ],
  "tags": ["relevant", "tags", "based", "on", "actual", "tool"],
  "targetAudience": "Specific target audience",
  "logoUrl": null,
  "screenshots": [],
  "confidenceScore": 0.7
}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const analysisText = completion.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No analysis received from OpenAI');
      }

      const rawAnalysis = JSON.parse(analysisText);
      const validatedAnalysis = ToolDataSchema.parse(rawAnalysis);
      
      return validatedAnalysis;
    } catch (error) {
      console.error('Error in basic analysis generation:', error);
      
      // Ultimate fallback - return category-specific valid structure
      const category = this.getCategoryFromUrl(url);
      const toolName = url.split('/')[2]?.split('.')[0]?.replace('www.', '') || 'Tool';
      
      return {
        name: toolName.charAt(0).toUpperCase() + toolName.slice(1),
        description: `A ${category.toLowerCase()} tool that provides AI-powered capabilities to enhance user workflows and productivity.`,
        shortDescription: `AI-powered ${category.toLowerCase()} tool`,
        category: category as any,
        subcategory: null,
        pricingType: 'freemium' as const,
        pricingDetails: 'Free tier available with premium features',
        features: [
          { title: "AI-Powered Engine", description: "Advanced AI technology for enhanced performance" },
          { title: "User-Friendly Interface", description: "Intuitive design for easy navigation and use" },
          { title: "Cloud-Based Platform", description: "Accessible from anywhere with internet connection" },
          { title: "Real-Time Processing", description: "Fast and efficient processing capabilities" },
          { title: "Integration Support", description: "Compatible with popular tools and workflows" }
        ],
        pros: ["Easy to use interface", "AI-powered capabilities", "Accessible online", "Regular updates"],
        cons: ["Requires internet connection", "May have learning curve", "Limited free features"],
        useCases: [`${category} enhancement`, "Workflow optimization", "Productivity improvement"],
        tags: ["ai", category.toLowerCase().replace(' ', '-'), "productivity", "tool", "automation"],
        targetAudience: `${category} professionals and teams`,
        logoUrl: null,
        screenshots: [],
        qaItems: [
          { question: "What does this tool do?", answer: `This tool provides AI-powered ${category.toLowerCase()} capabilities to enhance your workflow.` },
          { question: "How much does it cost?", answer: "It offers a freemium model with free basic features and premium paid options." },
          { question: "Who is the target audience?", answer: `Designed for ${category.toLowerCase()} professionals and teams looking to improve productivity.` },
          { question: "Is an account required?", answer: "Yes, most features require creating an account for personalized experience and data sync." }
        ],
        confidenceScore: 0.4
      };
    }
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

// Quick Fix AI service for suggesting improvements
export async function generateQuickFixes(content: string, contentType: 'description' | 'code' | 'features' | 'name' | 'pricing'): Promise<{
  suggestions: Array<{
    type: 'grammar' | 'clarity' | 'structure' | 'completeness' | 'optimization';
    original: string;
    improved: string;
    reason: string;
  }>;
  improvedContent: string;
}> {
  try {
    const systemPrompt = getQuickFixSystemPrompt(contentType);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze and improve this ${contentType}: "${content}"` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      suggestions: result.suggestions || [],
      improvedContent: result.improvedContent || content
    };
  } catch (error) {
    console.error('Error generating quick fixes:', error);
    throw new Error('Failed to generate quick fixes');
  }
}

function getQuickFixSystemPrompt(contentType: string): string {
  const basePrompt = `You are an AI writing assistant specializing in improving ${contentType} for AI tools and software products. 
Analyze the provided content and suggest specific improvements focusing on clarity, professionalism, and user engagement.

Respond with JSON in this exact format:
{
  "suggestions": [
    {
      "type": "grammar|clarity|structure|completeness|optimization",
      "original": "exact text from input that needs improvement",
      "improved": "improved version of that text",
      "reason": "brief explanation of why this improvement helps"
    }
  ],
  "improvedContent": "complete improved version of the entire input text"
}`;

  const specificGuidance = {
    'description': 'Focus on making descriptions more engaging, clear, and benefit-focused. Ensure proper grammar, remove redundancy, and highlight unique value propositions.',
    'code': 'Focus on code readability, best practices, performance optimizations, and proper documentation. Suggest cleaner syntax and better structure.',
    'features': 'Focus on making features more compelling and benefit-focused. Use action-oriented language and highlight user value.',
    'name': 'Focus on making names more memorable, descriptive, and brandable while maintaining clarity about the tools purpose.',
    'pricing': 'Focus on clarity, value communication, and proper formatting of pricing information.'
  };

  return `${basePrompt}\n\nSpecific guidance for ${contentType}: ${specificGuidance[contentType as keyof typeof specificGuidance] || specificGuidance['description']}`;
}

export async function analyzeToolFromURL(url: string): Promise<AnalysisResult> {
  const analyzer = new AIToolAnalyzer();
  return analyzer.analyzeToolFromUrl(url);
}