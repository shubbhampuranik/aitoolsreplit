import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Import feature routes
import { createToolRoutes } from "./features/tools/routes";
import { createReviewRoutes } from "./features/reviews/routes";
import { createAdminRoutes } from "./features/admin/routes";
import { createUserRoutes } from "./features/users/routes";

// Import services for backwards compatibility
import { ToolService } from "./features/tools/service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Feature-based routes
  app.use('/api/tools', createToolRoutes(storage));
  app.use('/api/reviews', createReviewRoutes(storage));
  app.use('/api/admin', createAdminRoutes(storage));
  app.use('/api/user', createUserRoutes(storage));

  // Legacy endpoints that need to be preserved for backwards compatibility
  const toolService = new ToolService(storage);

  // Tool search for autocomplete
  app.get('/api/tools-search', async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const searchResults = await toolService.searchTools(q as string, parseInt(limit as string));
      
      // Return simplified tool objects for autocomplete
      const results = searchResults.map(tool => ({
        id: tool.id,
        name: tool.name,
        logoUrl: tool.logoUrl,
        shortDescription: tool.shortDescription
      }));

      res.json(results);
    } catch (error) {
      console.error("Error searching tools:", error);
      res.status(500).json({ message: "Failed to search tools" });
    }
  });

  // Tool reviews endpoint (backwards compatibility)
  app.get('/api/tools/:id/reviews', async (req, res) => {
    try {
      const toolId = req.params.id;
      
      // Get approved reviews from database
      const reviews = await storage.getReviews(toolId, 'approved');

      // If no reviews exist and this is ChatGPT, return mock reviews for demo
      if (reviews.length === 0) {
        const tool = await storage.getTool(toolId);
        if (tool && tool.name === "ChatGPT") {
          const mockReviews = [
            {
              id: "review-1",
              rating: 5,
              title: "Game-changer for productivity",
              content: "ChatGPT has completely transformed how I approach writing and research. The quality of responses is incredible, and it maintains context beautifully across long conversations. As a content creator, it's become an indispensable tool for brainstorming, drafting, and editing. The GPT-4 model in particular shows remarkable reasoning capabilities.",
              author: {
                firstName: "Sarah",
                lastName: "Johnson",
                profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b772b553?w=50&h=50&fit=crop&crop=face"
              },
              createdAt: "2024-01-15T10:30:00Z",
              helpful: 24
            },
            {
              id: "review-2", 
              rating: 4,
              title: "Excellent for coding assistance",
              content: "As a software developer, I use ChatGPT daily for code review, debugging, and learning new technologies. It explains complex concepts clearly and provides practical examples. The code it generates is usually high-quality and well-commented. Only downside is the knowledge cutoff for very recent frameworks.",
              author: {
                firstName: "Michael",
                lastName: "Chen",
                profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
              },
              createdAt: "2024-01-12T14:22:00Z",
              helpful: 18
            }
          ];
          return res.json(mockReviews);
        }
      }

      res.json(reviews);
    } catch (error) {
      console.error("Error fetching tool reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // General statistics endpoint
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await toolService.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Categories endpoint
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Bookmark count endpoint
  app.get('/api/items/:itemType/:itemId/bookmark-count', async (req, res) => {
    try {
      const { itemType, itemId } = req.params;
      const count = await storage.getBookmarkCount(itemType, itemId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching bookmark count:", error);
      res.status(500).json({ message: "Failed to fetch bookmark count" });
    }
  });

  // AI-powered automation endpoints
  app.post('/api/ai/discover-logo', isAuthenticated, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      
      console.log('Discovering logo for:', url);
      
      // Import logo service dynamically to avoid import issues
      const { LogoAutomation } = await import('./logoAutomation');
      const logoService = new LogoAutomation();
      
      const logos = await logoService.discoverLogo(url);
      const bestLogo = logoService.selectBestLogo(logos);
      
      res.json({
        logos: logos.slice(0, 5), // Return top 5 options
        bestLogo,
        totalFound: logos.length
      });
    } catch (error) {
      console.error('Error discovering logo:', error);
      res.status(500).json({ error: 'Failed to discover logo' });
    }
  });

  app.post('/api/ai/discover-media', isAuthenticated, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      
      console.log('Discovering media for:', url);
      
      // Import media service dynamically to avoid import issues
      const { MediaDiscovery } = await import('./screenshotAutomation');
      const mediaService = new MediaDiscovery();
      
      const mediaResult = await mediaService.discoverMedia(url);
      const bestMedia = mediaService.selectBestMedia(mediaResult);
      
      res.json({
        ...mediaResult,
        bestScreenshots: bestMedia.bestScreenshots,
        bestVideos: bestMedia.bestVideos
      });
    } catch (error) {
      console.error('Error discovering media:', error);
      res.status(500).json({ error: 'Failed to discover media' });
    }
  });

  // Content upload and processing routes
  app.post('/api/upload/logo', isAuthenticated, async (req, res) => {
    try {
      // Logo upload logic here
      res.json({ message: "Logo upload endpoint - to be implemented" });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  app.post('/api/upload/media', isAuthenticated, async (req, res) => {
    try {
      // Media upload logic here
      res.json({ message: "Media upload endpoint - to be implemented" });
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ message: "Failed to upload media" });
    }
  });

  // Placeholder image endpoint
  app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="14" fill="#9ca3af">
          ${width}x${height}
        </text>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(svg);
  });

  const httpServer = createServer(app);
  return httpServer;
}