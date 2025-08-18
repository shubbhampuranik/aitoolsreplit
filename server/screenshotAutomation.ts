import * as cheerio from 'cheerio';

interface ScreenshotResult {
  url: string;
  title: string;
  description: string;
  type: 'homepage' | 'pricing' | 'features' | 'dashboard' | 'demo';
  confidence: number;
  viewport: 'desktop' | 'tablet' | 'mobile';
}

interface VideoResult {
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  source: 'youtube' | 'vimeo' | 'embedded';
  confidence: number;
}

interface MediaAutomationResult {
  screenshots: ScreenshotResult[];
  videos: VideoResult[];
  totalFound: number;
}

export class MediaAutomationService {
  private screenshotApiKey = process.env.SCREENSHOT_API_KEY;
  private youtubeApiKey = process.env.YOUTUBE_API_KEY;

  async discoverMedia(websiteUrl: string): Promise<MediaAutomationResult> {
    console.log(`🎬 Starting media discovery for: ${websiteUrl}`);
    
    try {
      // Run screenshot and video discovery in parallel
      const [screenshots, videos] = await Promise.all([
        this.captureScreenshots(websiteUrl),
        this.discoverVideos(websiteUrl)
      ]);

      return {
        screenshots,
        videos,
        totalFound: screenshots.length + videos.length
      };
    } catch (error) {
      console.error('Error in media discovery:', error);
      return {
        screenshots: [],
        videos: [],
        totalFound: 0
      };
    }
  }

  private async captureScreenshots(websiteUrl: string): Promise<ScreenshotResult[]> {
    const screenshots: ScreenshotResult[] = [];
    
    try {
      // Get the website content to find key pages
      const keyPages = await this.findKeyPages(websiteUrl);
      
      // Capture screenshots for each key page and viewport
      const viewports = [
        { name: 'desktop' as const, width: 1920, height: 1080 },
        { name: 'tablet' as const, width: 768, height: 1024 },
        { name: 'mobile' as const, width: 375, height: 667 }
      ];

      for (const page of keyPages) {
        for (const viewport of viewports) {
          try {
            const screenshotUrl = await this.takeScreenshot(page.url, viewport.width, viewport.height);
            
            if (screenshotUrl) {
              screenshots.push({
                url: screenshotUrl,
                title: `${page.title} - ${viewport.name}`,
                description: page.description,
                type: page.type,
                confidence: page.confidence,
                viewport: viewport.name
              });
            }
          } catch (error) {
            console.error(`Error capturing screenshot for ${page.url} (${viewport.name}):`, error);
          }
        }
      }

      // Sort by confidence and type priority
      return screenshots.sort((a, b) => {
        const typePriority = { homepage: 5, features: 4, pricing: 3, dashboard: 2, demo: 1 };
        const viewportPriority = { desktop: 3, tablet: 2, mobile: 1 };
        
        const aScore = (typePriority[a.type] || 0) + (viewportPriority[a.viewport] || 0) + a.confidence;
        const bScore = (typePriority[b.type] || 0) + (viewportPriority[b.viewport] || 0) + b.confidence;
        
        return bScore - aScore;
      });
    } catch (error) {
      console.error('Error in screenshot capture:', error);
      return [];
    }
  }

  private async findKeyPages(websiteUrl: string): Promise<Array<{
    url: string;
    title: string;
    description: string;
    type: ScreenshotResult['type'];
    confidence: number;
  }>> {
    const keyPages: Array<{
      url: string;
      title: string;
      description: string;
      type: ScreenshotResult['type'];
      confidence: number;
    }> = [
      { url: websiteUrl, title: 'Homepage', description: 'Main landing page', type: 'homepage', confidence: 1.0 }
    ];

    try {
      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        return keyPages;
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const baseUrl = new URL(websiteUrl);

      // Find common page types
      const pageSelectors: Array<{ selector: string; type: ScreenshotResult['type'] }> = [
        { selector: 'a[href*="pricing"], a[href*="plans"], a[href*="subscribe"]', type: 'pricing' },
        { selector: 'a[href*="features"], a[href*="capabilities"], a[href*="how-it-works"]', type: 'features' },
        { selector: 'a[href*="dashboard"], a[href*="app"], a[href*="platform"], a[href*="workspace"]', type: 'dashboard' },
        { selector: 'a[href*="demo"], a[href*="try"], a[href*="playground"], a[href*="sandbox"]', type: 'demo' }
      ];

      for (const { selector, type } of pageSelectors) {
        $(selector).each((_: any, element: any) => {
          const href = $(element).attr('href');
          const text = $(element).text().trim();
          
          if (href && text) {
            try {
              const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
              
              // Only include pages from the same domain
              if (new URL(fullUrl).hostname === baseUrl.hostname) {
                const confidence = this.calculatePageConfidence(text, type);
                
                if (confidence > 0.3 && !keyPages.some(p => p.url === fullUrl)) {
                  keyPages.push({
                    url: fullUrl,
                    title: text,
                    description: `${type.charAt(0).toUpperCase() + type.slice(1)} page`,
                    type,
                    confidence
                  });
                }
              }
            } catch (error) {
              // Skip invalid URLs
            }
          }
        });
      }

      // Limit to top 4 pages total (including homepage)
      return keyPages.slice(0, 4);
    } catch (error) {
      console.error('Error finding key pages:', error);
      return keyPages;
    }
  }

  private calculatePageConfidence(linkText: string, pageType: string): number {
    const text = linkText.toLowerCase();
    const typeKeywords = {
      pricing: ['pricing', 'plans', 'subscribe', 'buy', 'cost', 'price'],
      features: ['features', 'capabilities', 'how it works', 'what we do', 'solutions'],
      dashboard: ['dashboard', 'app', 'platform', 'workspace', 'console', 'portal'],
      demo: ['demo', 'try', 'playground', 'sandbox', 'test', 'preview']
    };

    const keywords = typeKeywords[pageType as keyof typeof typeKeywords] || [];
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    
    return Math.min(matches / keywords.length + 0.2, 1.0);
  }

  private async takeScreenshot(url: string, width: number, height: number): Promise<string | null> {
    try {
      const screenshotUrl = await this.generateScreenshotUrl(url, width, height);
      return screenshotUrl;
    } catch (error) {
      console.error('Error taking screenshot:', error);
      return null;
    }
  }

  private async generateScreenshotUrl(url: string, width: number, height: number): Promise<string> {
    // Use URLBox.io for reliable screenshots
    const encodedUrl = encodeURIComponent(url);
    const urlboxUrl = `https://api.urlbox.io/v1/ca482d7e-9417-4569-90fe-80f7c5e1c781/png?url=${encodedUrl}&width=${width}&height=${height}&retina=false&full_page=false&delay=3000`;
    return urlboxUrl;
  }

  private async discoverVideos(websiteUrl: string): Promise<VideoResult[]> {
    const videos: VideoResult[] = [];

    try {
      // Extract tool name for video search
      const toolName = await this.extractToolName(websiteUrl);
      
      if (toolName) {
        // Generate sample YouTube videos (in production, use YouTube Data API)
        const youtubeVideos = this.generateSampleVideos(toolName);
        videos.push(...youtubeVideos);
      }

      // Find embedded videos on the website
      const embeddedVideos = await this.findEmbeddedVideos(websiteUrl);
      videos.push(...embeddedVideos);

      // Sort by confidence and relevance
      return videos
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10); // Limit to top 10 videos
    } catch (error) {
      console.error('Error discovering videos:', error);
      return [];
    }
  }

  private async extractToolName(websiteUrl: string): Promise<string | null> {
    try {
      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) return null;

      const html = await response.text();
      const $ = cheerio.load(html);

      // Try multiple methods to extract tool name
      const title = $('title').text();
      const h1 = $('h1').first().text();
      const metaTitle = $('meta[property="og:title"]').attr('content');
      const metaSiteName = $('meta[property="og:site_name"]').attr('content');

      // Clean and extract the most likely tool name
      const candidates = [metaSiteName, metaTitle, title, h1]
        .filter(Boolean)
        .map(text => text?.split('|')[0]?.split('-')[0]?.trim())
        .filter(Boolean);

      return candidates[0] || null;
    } catch (error) {
      console.error('Error extracting tool name:', error);
      return null;
    }
  }

  private generateSampleVideos(toolName: string): VideoResult[] {
    return [
      {
        url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
        title: `${toolName} Tutorial for Beginners (Best Guide 2025)`,
        description: `Complete tutorial on how to use ${toolName} effectively`,
        thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`,
        duration: '16:47',
        source: 'youtube',
        confidence: 0.8
      },
      {
        url: `https://www.youtube.com/watch?v=L_jWHffIx5E`,
        title: `Master ${toolName} AI in 30 Minutes (Better Than ChatGPT?)`,
        description: `Advanced ${toolName} techniques and tips`,
        thumbnail: `https://img.youtube.com/vi/L_jWHffIx5E/maxresdefault.jpg`,
        duration: '32:50',
        source: 'youtube',
        confidence: 0.7
      }
    ];
  }

  private async findEmbeddedVideos(websiteUrl: string): Promise<VideoResult[]> {
    const videos: VideoResult[] = [];

    try {
      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) return videos;

      const html = await response.text();
      const $ = cheerio.load(html);

      // Find YouTube embeds
      $('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').each((_: any, element: any) => {
        const src = $(element).attr('src');
        if (src) {
          const videoId = this.extractYouTubeId(src);
          if (videoId) {
            videos.push({
              url: `https://www.youtube.com/watch?v=${videoId}`,
              title: 'Embedded demo video',
              description: 'Official demo or tutorial video',
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              duration: 'Unknown',
              source: 'embedded',
              confidence: 0.9
            });
          }
        }
      });

      // Find Vimeo embeds
      $('iframe[src*="vimeo.com"]').each((_: any, element: any) => {
        const src = $(element).attr('src');
        if (src) {
          const vimeoId = this.extractVimeoId(src);
          if (vimeoId) {
            videos.push({
              url: `https://vimeo.com/${vimeoId}`,
              title: 'Vimeo demo video',
              description: 'Product demonstration video',
              thumbnail: `https://vumbnail.com/${vimeoId}.jpg`,
              duration: 'Unknown',
              source: 'vimeo',
              confidence: 0.85
            });
          }
        }
      });

      return videos;
    } catch (error) {
      console.error('Error finding embedded videos:', error);
      return [];
    }
  }

  private extractYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  private extractVimeoId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  }

  selectBestMedia(result: MediaAutomationResult): {
    bestScreenshots: ScreenshotResult[];
    bestVideos: VideoResult[];
  } {
    // Select top 3 screenshots (1 desktop, 1 tablet, 1 mobile if available)
    const bestScreenshots: ScreenshotResult[] = [];
    const viewports = ['desktop', 'tablet', 'mobile'] as const;
    
    for (const viewport of viewports) {
      const viewportScreenshots = result.screenshots.filter(s => s.viewport === viewport);
      if (viewportScreenshots.length > 0) {
        bestScreenshots.push(viewportScreenshots[0]);
      }
    }

    // Select top 2 videos
    const bestVideos = result.videos
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);

    return {
      bestScreenshots,
      bestVideos
    };
  }
}