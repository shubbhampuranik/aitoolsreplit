import * as cheerio from 'cheerio';
import { URL } from 'url';

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
      // Use a screenshot service API (like ScreenshotAPI, Urlbox, or similar)
      // For now, we'll use a free service or implement with Puppeteer
      const screenshotUrl = await this.generateScreenshotUrl(url, width, height);
      return screenshotUrl;
    } catch (error) {
      console.error('Error taking screenshot:', error);
      return null;
    }
  }

  private async generateScreenshotUrl(url: string, width: number, height: number): Promise<string> {
    // Using screenshot.rocks as a free alternative
    const encodedUrl = encodeURIComponent(url);
    return `https://image.thum.io/get/width/${width}/crop/${width}/${height}/${encodedUrl}`;
  }

  private async discoverVideos(websiteUrl: string): Promise<VideoResult[]> {
    const videos: VideoResult[] = [];

    try {
      // Extract tool name for YouTube search
      const toolName = await this.extractToolName(websiteUrl);
      
      if (toolName) {
        // Search YouTube for tool-related videos
        const youtubeVideos = await this.searchYouTubeVideos(toolName);
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

  private async searchYouTubeVideos(toolName: string): Promise<VideoResult[]> {
    const videos: VideoResult[] = [];

    try {
      // Search terms to find relevant videos
      const searchTerms = [
        `${toolName} tutorial`,
        `${toolName} demo`,
        `${toolName} review`,
        `${toolName} how to use`,
        `${toolName} AI tool`
      ];

      for (const searchTerm of searchTerms.slice(0, 2)) { // Limit searches
        try {
          const searchResults = await this.youtubeSearch(searchTerm);
          videos.push(...searchResults);
        } catch (error) {
          console.error(`Error searching YouTube for "${searchTerm}":`, error);
        }
      }

      // Remove duplicates and filter by relevance
      const uniqueVideos = videos.filter((video, index, self) => 
        index === self.findIndex(v => v.url === video.url)
      );

      return uniqueVideos;
    } catch (error) {
      console.error('Error in YouTube search:', error);
      return [];
    }
  }

  private async youtubeSearch(query: string): Promise<VideoResult[]> {
    try {
      // Use YouTube Data API if available, otherwise fall back to scraping
      if (this.youtubeApiKey) {
        return await this.youtubeApiSearch(query);
      } else {
        return await this.youtubeScrapingSearch(query);
      }
    } catch (error) {
      console.error('Error in YouTube search:', error);
      return [];
    }
  }

  private async youtubeApiSearch(query: string): Promise<VideoResult[]> {
    // YouTube Data API implementation (if API key is available)
    return [];
  }

  private async youtubeScrapingSearch(query: string): Promise<VideoResult[]> {
    const videos: VideoResult[] = [];
    
    try {
      const encodedQuery = encodeURIComponent(query);
      const searchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) return videos;

      const html = await response.text();
      
      // Extract video data from YouTube search results
      const videoMatches = html.match(/var ytInitialData = ({.*?});/);
      if (videoMatches) {
        try {
          const data = JSON.parse(videoMatches[1]);
          const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
          
          if (contents) {
            for (const item of contents.slice(0, 5)) { // Limit to first 5 results
              if (item.videoRenderer) {
                const video = item.videoRenderer;
                const videoId = video.videoId;
                const title = video.title?.runs?.[0]?.text || '';
                const description = video.descriptionSnippet?.runs?.map((r: any) => r.text).join('') || '';
                const duration = video.lengthText?.simpleText || '';
                const thumbnail = video.thumbnail?.thumbnails?.[0]?.url || '';
                
                if (videoId && title) {
                  const confidence = this.calculateVideoRelevance(title, description, query);
                  
                  videos.push({
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    title,
                    description,
                    thumbnail,
                    duration,
                    source: 'youtube',
                    confidence
                  });
                }
              }
            }
          }
        } catch (parseError) {
          console.error('Error parsing YouTube data:', parseError);
        }
      }
    } catch (error) {
      console.error('Error scraping YouTube:', error);
    }

    return videos;
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
              title: 'Embedded Video',
              description: 'Video found on the official website',
              thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              duration: '',
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
          videos.push({
            url: src,
            title: 'Vimeo Video',
            description: 'Vimeo video found on the official website',
            thumbnail: '',
            duration: '',
            source: 'vimeo',
            confidence: 0.8
          });
        }
      });

    } catch (error) {
      console.error('Error finding embedded videos:', error);
    }

    return videos;
  }

  private extractYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  private calculateVideoRelevance(title: string, description: string, query: string): number {
    const text = (title + ' ' + description).toLowerCase();
    const queryTerms = query.toLowerCase().split(' ');
    
    let score = 0;
    for (const term of queryTerms) {
      if (text.includes(term)) {
        score += 0.2;
      }
    }

    // Boost for tutorial/demo videos
    if (text.includes('tutorial') || text.includes('demo') || text.includes('how to')) {
      score += 0.3;
    }

    // Boost for official channels
    if (text.includes('official') || text.includes('overview')) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  selectBestMedia(result: MediaAutomationResult): {
    bestScreenshots: ScreenshotResult[];
    bestVideos: VideoResult[];
  } {
    // Select top 3 screenshots (one per viewport for homepage)
    const bestScreenshots = result.screenshots
      .filter(s => s.type === 'homepage')
      .slice(0, 3);

    // If we don't have enough homepage screenshots, add others
    if (bestScreenshots.length < 3) {
      const otherScreenshots = result.screenshots
        .filter(s => s.type !== 'homepage')
        .slice(0, 3 - bestScreenshots.length);
      bestScreenshots.push(...otherScreenshots);
    }

    // Select top 2 videos
    const bestVideos = result.videos
      .slice(0, 2);

    return {
      bestScreenshots,
      bestVideos
    };
  }
}