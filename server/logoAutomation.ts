import * as cheerio from 'cheerio';
import { URL } from 'url';

interface LogoResult {
  url: string;
  confidence: number;
  source: 'favicon' | 'meta' | 'og' | 'logo-element' | 'brand-asset';
  size?: { width: number; height: number };
}

export class LogoAutomationService {
  
  /**
   * Automatically discover and extract logos from a website URL
   */
  async discoverLogo(websiteUrl: string): Promise<LogoResult[]> {
    try {
      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch website: ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      const baseUrl = new URL(websiteUrl);
      const logos: LogoResult[] = [];
      
      // 1. Check for high-quality favicon links
      await this.extractFavicons($, baseUrl, logos);
      
      // 2. Check for Open Graph images
      await this.extractOpenGraphImages($, baseUrl, logos);
      
      // 3. Check for meta tags with logo information
      await this.extractMetaLogos($, baseUrl, logos);
      
      // 4. Search for logo elements in the page
      await this.extractLogoElements($, baseUrl, logos);
      
      // 5. Try common logo paths
      await this.tryCommonLogoPaths(baseUrl, logos);
      
      // Sort by confidence score (highest first)
      return logos.sort((a, b) => b.confidence - a.confidence);
      
    } catch (error) {
      console.error('Error discovering logo:', error);
      return [];
    }
  }
  
  /**
   * Extract favicon links from HTML
   */
  private async extractFavicons($: cheerio.CheerioAPI, baseUrl: URL, logos: LogoResult[]): Promise<void> {
    const faviconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]'
    ];
    
    faviconSelectors.forEach(selector => {
      $(selector).each((_: any, element: any) => {
        const href = $(element).attr('href');
        const sizes = $(element).attr('sizes');
        
        if (href) {
          const logoUrl = this.resolveUrl(href, baseUrl);
          const confidence = this.calculateFaviconConfidence(selector, sizes);
          
          logos.push({
            url: logoUrl,
            confidence,
            source: 'favicon',
            size: this.parseSizes(sizes)
          });
        }
      });
    });
  }
  
  /**
   * Extract Open Graph images
   */
  private async extractOpenGraphImages($: cheerio.CheerioAPI, baseUrl: URL, logos: LogoResult[]): Promise<void> {
    const ogImage = $('meta[property="og:image"]').attr('content');
    const ogLogo = $('meta[property="og:logo"]').attr('content');
    
    if (ogImage) {
      logos.push({
        url: this.resolveUrl(ogImage, baseUrl),
        confidence: 0.7,
        source: 'og'
      });
    }
    
    if (ogLogo) {
      logos.push({
        url: this.resolveUrl(ogLogo, baseUrl),
        confidence: 0.9,
        source: 'og'
      });
    }
  }
  
  /**
   * Extract meta tag logos
   */
  private async extractMetaLogos($: cheerio.CheerioAPI, baseUrl: URL, logos: LogoResult[]): Promise<void> {
    // Check for common meta logo patterns
    const metaSelectors = [
      'meta[name="logo"]',
      'meta[name="brand-logo"]',
      'meta[property="logo"]',
      'meta[itemprop="logo"]'
    ];
    
    metaSelectors.forEach(selector => {
      const content = $(selector).attr('content');
      if (content) {
        logos.push({
          url: this.resolveUrl(content, baseUrl),
          confidence: 0.8,
          source: 'meta'
        });
      }
    });
  }
  
  /**
   * Search for logo elements in the page
   */
  private async extractLogoElements($: cheerio.CheerioAPI, baseUrl: URL, logos: LogoResult[]): Promise<void> {
    // Common logo selectors
    const logoSelectors = [
      '.logo img',
      '.brand img',
      '.header-logo img',
      '.navbar-brand img',
      '[class*="logo"] img',
      '[id*="logo"] img',
      'img[alt*="logo" i]',
      'img[alt*="brand" i]',
      'img[src*="logo" i]'
    ];
    
    logoSelectors.forEach(selector => {
      $(selector).each((_: any, element: any) => {
        const src = $(element).attr('src');
        const alt = $(element).attr('alt') || '';
        
        if (src) {
          const confidence = this.calculateElementConfidence(selector, alt);
          
          logos.push({
            url: this.resolveUrl(src, baseUrl),
            confidence,
            source: 'logo-element'
          });
        }
      });
    });
  }
  
  /**
   * Try common logo file paths
   */
  private async tryCommonLogoPaths(baseUrl: URL, logos: LogoResult[]): Promise<void> {
    const commonPaths = [
      '/logo.png',
      '/logo.svg',
      '/assets/logo.png',
      '/assets/logo.svg',
      '/images/logo.png',
      '/images/logo.svg',
      '/static/logo.png',
      '/static/logo.svg',
      '/media/logo.png',
      '/media/logo.svg'
    ];
    
    for (const path of commonPaths) {
      try {
        const logoUrl = new URL(path, baseUrl).toString();
        const response = await fetch(logoUrl, { method: 'HEAD' });
        
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          logos.push({
            url: logoUrl,
            confidence: 0.6,
            source: 'brand-asset'
          });
        }
      } catch (error) {
        // Ignore errors for non-existent paths
      }
    }
  }
  
  /**
   * Calculate confidence score for favicon
   */
  private calculateFaviconConfidence(selector: string, sizes?: string): number {
    let confidence = 0.5;
    
    // Higher confidence for apple-touch-icon (usually high quality)
    if (selector.includes('apple-touch-icon')) {
      confidence = 0.8;
    }
    
    // Boost confidence for larger sizes
    if (sizes) {
      const sizeMatch = sizes.match(/(\d+)x(\d+)/);
      if (sizeMatch) {
        const size = parseInt(sizeMatch[1]);
        if (size >= 180) confidence += 0.2;
        else if (size >= 120) confidence += 0.1;
      }
    }
    
    return Math.min(confidence, 1.0);
  }
  
  /**
   * Calculate confidence score for logo elements
   */
  private calculateElementConfidence(selector: string, alt: string): number {
    let confidence = 0.4;
    
    // Higher confidence for specific logo classes
    if (selector.includes('.logo') || selector.includes('.brand')) {
      confidence = 0.7;
    }
    
    // Boost confidence based on alt text
    const altLower = alt.toLowerCase();
    if (altLower.includes('logo')) confidence += 0.2;
    if (altLower.includes('brand')) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
  
  /**
   * Resolve relative URLs to absolute URLs
   */
  private resolveUrl(url: string, baseUrl: URL): string {
    try {
      return new URL(url, baseUrl).toString();
    } catch (error) {
      return url;
    }
  }
  
  /**
   * Parse sizes attribute
   */
  private parseSizes(sizes?: string): { width: number; height: number } | undefined {
    if (!sizes) return undefined;
    
    const match = sizes.match(/(\d+)x(\d+)/);
    if (match) {
      return {
        width: parseInt(match[1]),
        height: parseInt(match[2])
      };
    }
    
    return undefined;
  }
  
  /**
   * Select the best logo from discovered options
   */
  selectBestLogo(logos: LogoResult[]): LogoResult | null {
    if (logos.length === 0) return null;
    
    // Filter out very low confidence logos
    const filtered = logos.filter(logo => logo.confidence >= 0.4);
    
    if (filtered.length === 0) return logos[0]; // Return best of bad options
    
    // Prefer SVG logos (scalable)
    const svgLogos = filtered.filter(logo => logo.url.toLowerCase().endsWith('.svg'));
    if (svgLogos.length > 0) {
      return svgLogos[0];
    }
    
    // Prefer high-resolution logos
    const highRes = filtered.filter(logo => 
      logo.size && (logo.size.width >= 120 || logo.size.height >= 120)
    );
    if (highRes.length > 0) {
      return highRes[0];
    }
    
    // Return highest confidence logo
    return filtered[0];
  }
}