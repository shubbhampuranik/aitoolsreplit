import type { Express } from "express";
import { storage } from "./storage";

/**
 * SEO-friendly server-side routes for better search engine indexing
 * These routes pre-render basic HTML with meta tags for each tool/page
 */
export function registerSEORoutes(app: Express) {
  
  // Tool details SEO route
  app.get('/tools/:id', async (req, res) => {
    try {
      const tool = await storage.getTool(req.params.id);
      
      if (!tool) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Tool Not Found - AI Community Portal</title>
            <meta name="description" content="The requested AI tool could not be found." />
          </head>
          <body>
            <h1>Tool Not Found</h1>
            <p>The requested AI tool could not be found.</p>
            <script>window.location.href = '/tools';</script>
          </body>
          </html>
        `);
      }

      // Pre-render HTML with tool-specific meta tags
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          
          <!-- Tool-specific SEO -->
          <title>${tool.name} - AI Tool Review & Details | AI Community Portal</title>
          <meta name="description" content="${tool.shortDescription || tool.description}" />
          <meta name="keywords" content="AI tool, ${tool.name}, ${Array.isArray(tool.tags) ? tool.tags.join(', ') : ''}, artificial intelligence" />
          
          <!-- Open Graph -->
          <meta property="og:title" content="${tool.name} - AI Tool Review" />
          <meta property="og:description" content="${tool.shortDescription || tool.description}" />
          <meta property="og:type" content="article" />
          <meta property="og:url" content="/tools/${tool.id}" />
          ${tool.logoUrl ? `<meta property="og:image" content="${tool.logoUrl}" />` : ''}
          
          <!-- Twitter Card -->
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${tool.name} - AI Tool Review" />
          <meta name="twitter:description" content="${tool.shortDescription || tool.description}" />
          ${tool.logoUrl ? `<meta name="twitter:image" content="${tool.logoUrl}" />` : ''}
          
          <!-- Structured Data for Tool -->
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "${tool.name}",
            "description": "${tool.description}",
            "url": "${tool.url}",
            ${tool.logoUrl ? `"image": "${tool.logoUrl}",` : ''}
            "applicationCategory": "AI Tool",
            "operatingSystem": "Web",
            ${tool.rating ? `"aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": ${tool.rating},
              "ratingCount": ${tool.ratingCount || 1}
            },` : ''}
            "offers": {
              "@type": "Offer",
              "price": "${tool.pricingType === 'free' ? '0' : 'varies'}",
              "priceCurrency": "USD"
            }
          }
          </script>
        </head>
        <body>
          <div id="root"></div>
          <script>
            // Pre-populate tool data for faster loading
            window.__TOOL_DATA__ = ${JSON.stringify(tool)};
          </script>
          <script type="module" src="/src/main.tsx"></script>
        </body>
        </html>
      `;
      
      res.send(html);
    } catch (error) {
      console.error('SEO route error:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // Category SEO routes
  app.get('/tools/category/:slug', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      const category = categories.find(cat => cat.slug === req.params.slug);
      
      if (!category) {
        return res.status(404).send('Category not found');
      }

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          
          <title>${category.name} AI Tools - Discover the Best ${category.name} Solutions | AI Community Portal</title>
          <meta name="description" content="Discover the best ${category.name} AI tools. ${category.description}" />
          <meta name="keywords" content="${category.name}, AI tools, artificial intelligence, ${category.name} software" />
          
          <meta property="og:title" content="${category.name} AI Tools - AI Community Portal" />
          <meta property="og:description" content="Discover the best ${category.name} AI tools. ${category.description}" />
          <meta property="og:type" content="website" />
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
        </html>
      `;
      
      res.send(html);
    } catch (error) {
      console.error('Category SEO route error:', error);
      res.status(500).send('Internal Server Error');
    }
  });
}