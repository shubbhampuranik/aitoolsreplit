import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertToolSchema, insertPromptSchema, insertCourseSchema, insertJobSchema, insertPostSchema, insertCommentSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { aiToolAnalyzer } from "./aiToolAnalyzer";
import { imageDownloader } from "./imageDownloader";
import { LogoAutomationService } from "./logoAutomation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  const logoService = new LogoAutomationService();
  
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

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Admin category management endpoints
  app.post('/api/admin/categories', isAuthenticated, async (req, res) => {
    try {
      const categoryData = req.body;
      
      // Generate slug from name if not provided
      if (!categoryData.slug && categoryData.name) {
        categoryData.slug = categoryData.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/admin/categories/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Update slug if name changed
      if (updates.name && !updates.slug) {
        updates.slug = updates.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      const category = await storage.updateCategory(id, updates);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/admin/categories/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCategory(id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Tools
  app.get('/api/tools', async (req, res) => {
    try {
      const {
        categoryId,
        featured,
        status,
        limit = 50,
        offset = 0,
        search,
      } = req.query;

      const tools = await storage.getTools({
        categoryId: categoryId as string,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        status: (status as string) || undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        search: search as string,
      });

      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.get('/api/tools/:id', async (req, res) => {
    try {
      const tool = await storage.getTool(req.params.id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      // Get tool categories for the new many-to-many system
      const categories = await storage.getToolCategories(req.params.id);
      
      res.json({ ...tool, categories });
    } catch (error) {
      console.error("Error fetching tool:", error);
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  app.get('/api/tools/:id/categories', async (req, res) => {
    try {
      const categories = await storage.getToolCategories(req.params.id);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching tool categories:", error);
      res.status(500).json({ message: "Failed to fetch tool categories" });
    }
  });

  app.post('/api/tools', isAuthenticated, async (req: any, res) => {
    try {
      const { categoryIds, ...toolData } = req.body;
      
      console.log('Creating tool with categoryIds:', categoryIds);
      
      const validatedData = insertToolSchema.parse({
        ...toolData,
        submittedBy: req.user.claims.sub,
      });
      
      const tool = await storage.createTool({ ...validatedData, categoryIds });
      
      // Initialize auto-alternatives for new tools
      if (tool.status === "approved") {
        await storage.initializeAutoAlternatives(tool.id);
      }
      
      res.status(201).json(tool);
    } catch (error) {
      console.error("Error creating tool:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tool" });
    }
  });

  // Prompts
  app.get('/api/prompts', async (req, res) => {
    try {
      const {
        categoryId,
        featured,
        isFree,
        status,
        limit = 50,
        offset = 0,
        search,
      } = req.query;

      const prompts = await storage.getPrompts({
        categoryId: categoryId as string,
        featured: featured === 'true',
        isFree: isFree === 'true',
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        search: search as string,
      });

      res.json(prompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  app.get('/api/prompts/:id', async (req, res) => {
    try {
      const prompt = await storage.getPrompt(req.params.id);
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      res.json(prompt);
    } catch (error) {
      console.error("Error fetching prompt:", error);
      res.status(500).json({ message: "Failed to fetch prompt" });
    }
  });

  app.post('/api/prompts', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPromptSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
      });
      
      const prompt = await storage.createPrompt(validatedData);
      res.status(201).json(prompt);
    } catch (error) {
      console.error("Error creating prompt:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create prompt" });
    }
  });

  // Courses
  app.get('/api/courses', async (req, res) => {
    try {
      const {
        categoryId,
        featured,
        skillLevel,
        status,
        limit = 50,
        offset = 0,
        search,
      } = req.query;

      const courses = await storage.getCourses({
        categoryId: categoryId as string,
        featured: featured === 'true',
        skillLevel: skillLevel as string,
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        search: search as string,
      });

      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCourseSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
      });
      
      const course = await storage.createCourse(validatedData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Jobs
  app.get('/api/jobs', async (req, res) => {
    try {
      const {
        categoryId,
        featured,
        remote,
        status,
        limit = 50,
        offset = 0,
        search,
      } = req.query;

      const jobs = await storage.getJobs({
        categoryId: categoryId as string,
        featured: featured === 'true',
        remote: remote === 'true',
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        search: search as string,
      });

      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertJobSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
      });
      
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  // Models routes
  app.get('/api/models', async (req, res) => {
    try {
      const {
        categoryId,
        featured,
        modelType,
        accessType,
        status,
        limit = 50,
        offset = 0,
        search,
      } = req.query;

      const models = await storage.getModels({
        categoryId: categoryId as string,
        featured: featured === 'true',
        modelType: modelType as string,
        accessType: accessType as string,
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        search: search as string,
      });

      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  app.get('/api/models/:id', async (req, res) => {
    try {
      const model = await storage.getModel(req.params.id);
      if (!model) {
        return res.status(404).json({ message: "Model not found" });
      }
      res.json(model);
    } catch (error) {
      console.error("Error fetching model:", error);
      res.status(500).json({ message: "Failed to fetch model" });
    }
  });

  // Posts
  app.get('/api/posts', async (req, res) => {
    try {
      const {
        categoryId,
        featured,
        status,
        authorId,
        limit = 50,
        offset = 0,
        search,
      } = req.query;

      const posts = await storage.getPosts({
        categoryId: categoryId as string,
        featured: featured === 'true',
        status: status as string,
        authorId: authorId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        search: search as string,
      });

      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPostSchema.parse({
        ...req.body,
        authorId: req.user.claims.sub,
      });
      
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Comments
  app.get('/api/comments/:itemType/:itemId', async (req, res) => {
    try {
      const { itemType, itemId } = req.params;
      const comments = await storage.getComments(itemType, itemId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/comments', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        userId: req.user.claims.sub,
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Bookmarks
  app.post('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const { itemType, itemId } = req.body;
      const userId = req.user.claims.sub;
      
      const isBookmarked = await storage.toggleBookmark(userId, itemType, itemId);
      res.json({ bookmarked: isBookmarked });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  app.get('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemType } = req.query;
      
      const bookmarks = await storage.getUserBookmarks(userId, itemType as string);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  // Votes
  app.post('/api/votes', isAuthenticated, async (req: any, res) => {
    try {
      const { itemType, itemId, voteType } = req.body;
      const userId = req.user.claims.sub;
      
      const result = await storage.voteOnItem(userId, itemType, itemId, voteType);
      res.json({
        userVote: result.userVote,
        upvotes: result.upvotes,
        downvotes: result.downvotes || 0
      });
    } catch (error) {
      console.error("Error voting:", error);
      res.status(500).json({ message: "Failed to vote" });
    }
  });

  // Collections
  app.get('/api/collections', async (req, res) => {
    try {
      const { userId, isPublic } = req.query;
      const collections = await storage.getCollections(
        userId as string,
        isPublic === 'true'
      );
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  // Search
  app.get('/api/search', async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const results = await storage.searchAll(q as string, parseInt(limit as string));
      res.json(results);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });

  // Stats
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // AI-Powered Tool Data Fetching
  app.post('/api/tools/fetch-data', isAuthenticated, async (req: any, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      console.log(`Starting AI analysis for URL: ${url}`);
      
      // Analyze tool with AI
      const analysis = await aiToolAnalyzer.analyzeToolFromUrl(url);
      
      if (!analysis.success) {
        return res.status(400).json({ 
          message: "Failed to analyze tool", 
          error: analysis.error 
        });
      }

      let toolData = analysis.data!;

      // Auto-create category if it doesn't exist
      if (toolData.category) {
        try {
          const existingCategories = await storage.getCategories();
          const categoryExists = existingCategories.some(cat => 
            cat.name.toLowerCase() === toolData.category.toLowerCase()
          );
          
          if (!categoryExists) {
            const slug = toolData.category.toLowerCase()
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            
            await storage.createCategory({
              name: toolData.category,
              description: `${toolData.category} related tools and services`,
              icon: 'Bot', // Default icon
              color: '#2563eb', // Default blue color
              slug: slug
            });
            console.log(`Auto-created category: ${toolData.category}`);
          }
        } catch (categoryError) {
          console.error("Error creating category:", categoryError);
          // Continue even if category creation fails
        }
      }

      // Download and store images if found
      if (toolData.logoUrl) {
        console.log(`Downloading logo: ${toolData.logoUrl}`);
        const logoResult = await imageDownloader.downloadAndStoreImage(toolData.logoUrl, 'logo');
        if (logoResult.success && logoResult.objectPath) {
          toolData.logoUrl = logoResult.objectPath;
        } else {
          console.warn(`Logo download failed: ${logoResult.error}`);
          toolData.logoUrl = undefined; // Remove if download failed
        }
      }

      // Download screenshots
      if (toolData.screenshots && toolData.screenshots.length > 0) {
        console.log(`Downloading ${toolData.screenshots.length} screenshots`);
        const screenshotResults = await imageDownloader.downloadMultipleImages(toolData.screenshots, 'screenshot');
        toolData.screenshots = screenshotResults
          .filter(result => result.result.success && result.result.objectPath)
          .map(result => result.result.objectPath!);
      }

      // Get existing tools for alternative suggestions
      const existingTools = await storage.getTools();
      const alternatives = await aiToolAnalyzer.suggestAlternatives(
        toolData.features?.map(f => f.title) || [],
        toolData.category,
        existingTools.map(t => ({ 
          id: t.id, 
          name: t.name, 
          category: '', // Will be fetched from categories relationship if needed
          features: (t.features as any)?.map((f: any) => f.title) || []
        }))
      );

      res.json({
        success: true,
        data: toolData,
        suggestedAlternatives: alternatives,
        webContentPreview: analysis.webContent
      });

    } catch (error) {
      console.error("Error in AI tool analysis:", error);
      res.status(500).json({ 
        message: "Failed to analyze tool", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Logo Automation endpoint
  app.post('/api/ai/discover-logo', isAuthenticated, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      
      console.log('Discovering logo for:', url);
      
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

  // AI Quick Fix endpoint
  app.post("/api/tools/quick-fix", async (req, res) => {
    try {
      const { content, contentType } = req.body;
      
      if (!content || !contentType) {
        return res.status(400).json({
          success: false,
          error: "Content and contentType are required"
        });
      }

      if (!['description', 'code', 'features', 'name', 'pricing'].includes(contentType)) {
        return res.status(400).json({
          success: false,
          error: "Invalid contentType. Must be one of: description, code, features, name, pricing"
        });
      }

      const { generateQuickFixes } = await import('./aiToolAnalyzer');
      const result = await generateQuickFixes(content, contentType);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in quick-fix endpoint:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Quick fix generation failed"
      });
    }
  });

  // Tool alternatives endpoint - Enhanced with auto-matching
  app.get('/api/tools/:id/alternatives', async (req, res) => {
    try {
      const toolId = req.params.id;
      const userId = (req as any).user?.claims?.sub || null;
      
      const tool = await storage.getTool(toolId);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }

      // Get stored alternatives first with enhanced data
      const storedAlternatives = await storage.getToolAlternativesWithDetails(toolId, userId);
      
      // If no stored alternatives, get auto-suggested ones and save them
      if (storedAlternatives.length === 0) {
        const autoSuggested = await storage.getAutoSuggestedAlternatives(toolId);
        
        // Save auto-suggested alternatives for future use
        for (const alternative of autoSuggested) {
          await storage.addToolAlternative(toolId, alternative.id, true);
        }
        
        // Return auto-suggested with enhanced data
        const enhancedAutoSuggested = await storage.getToolAlternativesWithDetails(toolId, userId);
        return res.json(enhancedAutoSuggested);
      }

      res.json(storedAlternatives);
    } catch (error) {
      console.error("Error fetching alternatives:", error);
      res.status(500).json({ message: "Failed to fetch alternatives" });
    }
  });

  // Add a tool alternative (manual) with duplicate prevention
  app.post('/api/admin/tools/:id/alternatives', isAuthenticated, async (req, res) => {
    try {
      const { id: toolId } = req.params;
      const { alternativeId } = req.body;
      
      // Check if alternative already exists
      const currentAlternatives = await storage.getToolAlternatives(toolId);
      const isDuplicate = currentAlternatives.some(alt => alt.id === alternativeId);
      
      if (isDuplicate) {
        return res.status(400).json({ message: "Alternative already exists" });
      }
      
      if (alternativeId === toolId) {
        return res.status(400).json({ message: "Cannot add tool as alternative to itself" });
      }
      
      await storage.addToolAlternative(toolId, alternativeId, false);
      res.json({ message: "Alternative added successfully" });
    } catch (error) {
      console.error("Error adding alternative:", error);
      res.status(500).json({ message: "Failed to add alternative" });
    }
  });

  // Remove a tool alternative
  app.delete('/api/admin/tools/:id/alternatives/:alternativeId', isAuthenticated, async (req, res) => {
    try {
      const { id: toolId, alternativeId } = req.params;
      
      await storage.removeToolAlternative(toolId, alternativeId);
      res.json({ message: "Alternative removed successfully" });
    } catch (error) {
      console.error("Error removing alternative:", error);
      res.status(500).json({ message: "Failed to remove alternative" });
    }
  });

  // Vote on alternative
  app.post('/api/tools/:toolId/alternatives/:alternativeId/vote', isAuthenticated, async (req: any, res) => {
    try {
      const { toolId, alternativeId } = req.params;
      const userId = req.user.claims.sub;
      
      const result = await storage.voteAlternative(toolId, alternativeId, userId);
      res.json(result);
    } catch (error) {
      console.error("Error voting on alternative:", error);
      res.status(500).json({ message: "Failed to vote on alternative" });
    }
  });

  // Get auto-suggested alternatives (for admin preview)
  app.get('/api/admin/tools/:id/suggested-alternatives', isAuthenticated, async (req, res) => {
    try {
      const { id: toolId } = req.params;
      
      // Get current alternatives to exclude from suggestions
      const currentAlternatives = await storage.getToolAlternatives(toolId);
      const currentAlternativeIds = currentAlternatives.map(alt => alt.id);
      
      // Get suggested alternatives and filter out current ones
      const allSuggestions = await storage.getAutoSuggestedAlternatives(toolId);
      const filteredSuggestions = allSuggestions.filter(alt => 
        !currentAlternativeIds.includes(alt.id) && alt.id !== toolId
      );
      
      res.json(filteredSuggestions);
    } catch (error) {
      console.error("Error fetching suggested alternatives:", error);
      res.status(500).json({ message: "Failed to fetch suggested alternatives" });
    }
  });

  // Tool-specific voting endpoint
  app.post('/api/tools/:id/vote', isAuthenticated, async (req: any, res) => {
    try {
      const toolId = req.params.id;
      const { type } = req.body; // 'up' or 'down'
      const userId = req.user.claims.sub;
      
      const voteType = type === 'up' ? 'up' : 'down';
      const result = await storage.voteOnItem(userId, 'tool', toolId, voteType);
      res.json({
        userVote: result.userVote,
        upvotes: result.upvotes,
        downvotes: result.downvotes || 0
      });
    } catch (error) {
      console.error("Error voting on tool:", error);
      res.status(500).json({ message: "Failed to vote on tool" });
    }
  });

  // Tool-specific bookmarking endpoint
  app.post('/api/tools/:id/bookmark', isAuthenticated, async (req: any, res) => {
    try {
      const toolId = req.params.id;
      const userId = req.user.claims.sub;
      
      const isBookmarked = await storage.toggleBookmark(userId, 'tool', toolId);
      res.json({ bookmarked: isBookmarked });
    } catch (error) {
      console.error("Error bookmarking tool:", error);
      res.status(500).json({ message: "Failed to bookmark tool" });
    }
  });

  // User interactions endpoint
  app.get('/api/user/interactions/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const itemId = req.params.itemId;
      const userId = req.user.claims.sub;
      const { itemType = 'tool' } = req.query;
      
      const interactions = await storage.getUserInteractions(userId, itemType as string, itemId);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching user interactions:", error);
      res.status(500).json({ message: "Failed to fetch user interactions" });
    }
  });

  // Bulk user interactions endpoint
  app.post('/api/user/interactions/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const { toolIds } = req.body;
      const userId = req.user.claims.sub;
      
      if (!toolIds || !Array.isArray(toolIds)) {
        return res.status(400).json({ message: "toolIds array is required" });
      }
      
      const interactions = await storage.getUserInteractionsBulk(userId, 'tool', toolIds);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching bulk user interactions:", error);
      res.status(500).json({ message: "Failed to fetch bulk user interactions" });
    }
  });

  // Tool reviews endpoint
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
            },
            {
              id: "review-3",
              rating: 5,
              title: "Perfect for creative writing",
              content: "I'm a novelist and ChatGPT has become my writing companion. It helps with character development, plot brainstorming, and even editing. The creative outputs are surprisingly sophisticated and it understands nuanced literary concepts. The conversational interface makes it feel like collaborating with a knowledgeable writing partner.",
              author: {
                firstName: "Emma",
                lastName: "Rodriguez",
                profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
              },
              createdAt: "2024-01-10T09:15:00Z",
              helpful: 15
            },
            {
              id: "review-4",
              rating: 4,
              title: "Great for research and analysis",
              content: "ChatGPT excels at breaking down complex topics and providing structured analysis. I use it for market research, competitor analysis, and synthesizing information from multiple sources. The ability to ask follow-up questions and dive deeper into topics is invaluable. Would love to see real-time web browsing in the free tier.",
              author: {
                firstName: "David",
                lastName: "Thompson",
                profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
              },
              createdAt: "2024-01-08T16:45:00Z",
              helpful: 12
            },
            {
              id: "review-5",
              rating: 4,
              title: "Helpful but has limitations",
              content: "ChatGPT is undeniably powerful and has helped me with everything from writing emails to solving math problems. The interface is clean and the responses are generally accurate. However, the usage limits on the free tier can be frustrating, and it sometimes generates confident-sounding but incorrect information. Overall still very valuable.",
              author: {
                firstName: "Lisa",
                lastName: "Park",
                profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face"
              },
              createdAt: "2024-01-06T11:30:00Z",
              helpful: 9
            }
          ];
          
          return res.json(mockReviews);
        }
      }

      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Submit review endpoint
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId,
        status: 'pending'
      });

      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Admin Review Management Routes
  app.get("/api/admin/reviews", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.query;
      const reviews = await storage.getAllReviewsForAdmin(status as string);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.patch("/api/admin/reviews/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reported, reportReason } = req.body;
      
      // Prepare updates object
      const updates: any = { status };
      
      // Clear report flags if provided
      if (reported !== undefined) {
        updates.reported = reported;
      }
      if (reportReason !== undefined) {
        updates.reportReason = reportReason;
      }
      
      const review = await storage.updateReview(id, updates);
      res.json(review);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Review voting endpoint
  // Admin reported reviews endpoint  
  app.get('/api/admin/reported-reviews', isAuthenticated, async (req, res) => {
    try {
      const reportedReviews = await storage.getReportedReviews();
      res.json(reportedReviews);
    } catch (error) {
      console.error("Error fetching reported reviews:", error);
      res.status(500).json({ message: "Failed to fetch reported reviews" });
    }
  });

  app.post("/api/reviews/:id/vote", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const result = await storage.toggleReviewHelpful(id, userId);
      res.json(result);
    } catch (error) {
      console.error("Error voting on review:", error);
      res.status(500).json({ message: "Failed to vote on review" });
    }
  });

  // Check if user voted on review
  app.get("/api/reviews/:id/vote-status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const userVoted = await storage.checkUserVotedReview(id, userId);
      res.json({ userVoted });
    } catch (error) {
      console.error("Error checking vote status:", error);
      res.status(500).json({ message: "Failed to check vote status" });
    }
  });

  // Report review endpoint
  app.post("/api/reviews/:id/report", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Report reason is required" });
      }
      
      const review = await storage.reportReview(id, reason);
      res.json({ message: "Review reported successfully", review });
    } catch (error) {
      console.error("Error reporting review:", error);
      res.status(500).json({ message: "Failed to report review" });
    }
  });

  // Admin Prompt Marketplace Routes
  app.get("/api/admin/prompts", isAuthenticated, async (req, res) => {
    try {
      const prompts = await storage.getAllPromptsForAdmin();
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching admin prompts:", error);
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  app.post("/api/admin/prompts", isAuthenticated, async (req, res) => {
    try {
      const promptData = req.body;
      const prompt = await storage.createPrompt(promptData);
      res.json(prompt);
    } catch (error) {
      console.error("Error creating prompt:", error);
      res.status(500).json({ message: "Failed to create prompt" });
    }
  });

  app.patch("/api/admin/prompts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const promptData = req.body;
      const prompt = await storage.updatePrompt(id, promptData);
      res.json(prompt);
    } catch (error) {
      console.error("Error updating prompt:", error);
      res.status(500).json({ message: "Failed to update prompt" });
    }
  });

  app.delete("/api/admin/prompts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePrompt(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting prompt:", error);
      res.status(500).json({ message: "Failed to delete prompt" });
    }
  });

  // Admin Tools Management Routes
  app.get("/api/admin/tools", isAuthenticated, async (req, res) => {
    try {
      const { search, status } = req.query;
      const tools = await storage.getToolsForAdmin({
        search: search as string,
        status: status as string,
      });
      res.json(tools);
    } catch (error) {
      console.error("Error fetching admin tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.get("/api/admin/tools/:id", isAuthenticated, async (req, res) => {
    try {
      const tool = await storage.getTool(req.params.id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      // Get tool categories for admin interface
      const categories = await storage.getToolCategories(req.params.id);
      
      res.json({ ...tool, categories });
    } catch (error) {
      console.error("Error fetching tool:", error);
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.put("/api/admin/tools/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryIds, ...updates } = req.body;
      
      console.log('Updating tool', id, 'with categoryIds:', categoryIds);
      
      const updatedTool = await storage.updateTool(id, { ...updates, categoryIds });
      res.json(updatedTool);
    } catch (error) {
      console.error("Error updating tool:", error);
      res.status(500).json({ message: "Failed to update tool" });
    }
  });

  // Delete tool
  app.delete("/api/admin/tools/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteTool(id);
      if (!success) {
        return res.status(404).json({ error: "Tool not found" });
      }
      
      res.json({ success: true, message: "Tool deleted successfully" });
    } catch (error) {
      console.error("Error deleting tool:", error);
      res.status(500).json({ error: "Failed to delete tool" });
    }
  });

  // Import categories from Google Sheets
  app.post("/api/admin/import-categories", isAuthenticated, async (req, res) => {
    try {
      const { categoriesData } = req.body;
      
      if (!categoriesData || !Array.isArray(categoriesData)) {
        return res.status(400).json({ error: "Invalid categories data" });
      }

      let imported = 0;
      let skipped = 0;
      
      for (const categoryData of categoriesData) {
        try {
          // Check if category already exists
          const existingCategories = await storage.getCategories();
          const exists = existingCategories.find(cat => 
            cat.slug === categoryData.slug || cat.name === categoryData.name
          );
          
          if (!exists) {
            await storage.createCategory({
              name: categoryData.name,
              slug: categoryData.slug,
              description: categoryData.description || `${categoryData.name} AI tools and services`,
              icon: '🤖', // Default icon
            });
            imported++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.error(`Error importing category ${categoryData.name}:`, error);
        }
      }
      
      res.json({ 
        success: true, 
        message: `Categories import completed. ${imported} imported, ${skipped} skipped.`,
        imported,
        skipped
      });
    } catch (error) {
      console.error("Error importing categories:", error);
      res.status(500).json({ error: "Failed to import categories" });
    }
  });

  app.patch("/api/admin/tools/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Log the update operation for debugging
      console.log(`Admin updating tool ${id} with:`, updates);
      
      // Handle complex data transformations
      const processedUpdates = { ...updates };
      
      // Ensure arrays are properly handled
      if (updates.features && typeof updates.features === 'string') {
        try {
          processedUpdates.features = JSON.parse(updates.features);
        } catch (e) {
          processedUpdates.features = [];
        }
      }
      
      if (updates.gallery && typeof updates.gallery === 'string') {
        try {
          processedUpdates.gallery = JSON.parse(updates.gallery);
        } catch (e) {
          processedUpdates.gallery = [];
        }
      }
      
      if (updates.prosAndCons && typeof updates.prosAndCons === 'string') {
        try {
          processedUpdates.prosAndCons = JSON.parse(updates.prosAndCons);
        } catch (e) {
          processedUpdates.prosAndCons = { pros: [], cons: [] };
        }
      }
      
      if (updates.alternatives && typeof updates.alternatives === 'string') {
        try {
          processedUpdates.alternatives = JSON.parse(updates.alternatives);
        } catch (e) {
          processedUpdates.alternatives = [];
        }
      }
      
      if (updates.faqs && typeof updates.faqs === 'string') {
        try {
          processedUpdates.faqs = JSON.parse(updates.faqs);
        } catch (e) {
          processedUpdates.faqs = [];
        }
      }
      
      const { categoryIds, ...finalUpdates } = processedUpdates;
      const tool = await storage.updateTool(id, { ...finalUpdates, categoryIds });
      res.json(tool);
    } catch (error) {
      console.error("Error updating tool:", error);
      res.status(500).json({ message: "Failed to update tool" });
    }
  });

  app.delete("/api/admin/tools/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTool(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tool:", error);
      res.status(500).json({ message: "Failed to delete tool" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
