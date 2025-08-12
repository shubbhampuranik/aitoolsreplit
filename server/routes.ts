import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertToolSchema, insertPromptSchema, insertCourseSchema, insertJobSchema, insertPostSchema, insertCommentSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

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
      res.json(tool);
    } catch (error) {
      console.error("Error fetching tool:", error);
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  app.post('/api/tools', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertToolSchema.parse({
        ...req.body,
        submittedBy: req.user.claims.sub,
      });
      
      const tool = await storage.createTool(validatedData);
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

  // Tool alternatives endpoint
  app.get('/api/tools/:id/alternatives', async (req, res) => {
    try {
      const toolId = req.params.id;
      
      // Check if this is ChatGPT tool and return comprehensive alternatives
      const tool = await storage.getTool(toolId);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }

      // For ChatGPT, return comprehensive alternatives data
      if (tool.name === "ChatGPT") {
        const alternatives = [
          {
            id: "claude-alt-1",
            name: "Claude",
            description: "Anthropic's AI assistant focused on helpful, harmless, and honest interactions. Excellent for analysis, writing, and complex reasoning tasks with strong safety measures.",
            logoUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop",
            url: "https://claude.ai",
            pricingType: "freemium",
            rating: 4.7,
            upvotes: 987,
            featured: true,
            categoryId: tool.categoryId
          },
          {
            id: "gemini-alt-2", 
            name: "Google Gemini",
            description: "Google's advanced AI assistant with multimodal capabilities. Integrates seamlessly with Google services and offers powerful reasoning across text, images, and code.",
            logoUrl: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop",
            url: "https://gemini.google.com",
            pricingType: "freemium",
            rating: 4.5,
            upvotes: 756,
            featured: true,
            categoryId: tool.categoryId
          },
          {
            id: "perplexity-alt-3",
            name: "Perplexity AI",
            description: "AI-powered search engine that provides real-time answers with citations. Combines the power of large language models with up-to-date web information.",
            logoUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop",
            url: "https://perplexity.ai",
            pricingType: "freemium", 
            rating: 4.4,
            upvotes: 632,
            featured: false,
            categoryId: tool.categoryId
          },
          {
            id: "copilot-alt-4",
            name: "Microsoft Copilot",
            description: "Microsoft's AI assistant integrated across Office 365 and Windows. Offers productivity-focused AI capabilities with enterprise-grade security.",
            logoUrl: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=100&h=100&fit=crop",
            url: "https://copilot.microsoft.com",
            pricingType: "freemium",
            rating: 4.3,
            upvotes: 543,
            featured: false,
            categoryId: tool.categoryId
          },
          {
            id: "jasper-alt-5",
            name: "Jasper AI",
            description: "AI writing assistant designed for marketing teams and content creators. Specializes in creating marketing copy, blog posts, and business content with brand consistency.",
            logoUrl: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=100&h=100&fit=crop",
            url: "https://jasper.ai",
            pricingType: "paid",
            rating: 4.2,
            upvotes: 467,
            featured: false,
            categoryId: tool.categoryId
          }
        ];
        
        return res.json(alternatives);
      }

      // For other tools, return empty array or basic alternatives
      res.json([]);
    } catch (error) {
      console.error("Error fetching alternatives:", error);
      res.status(500).json({ message: "Failed to fetch alternatives" });
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
  app.post('/api/reviews', isAuthenticated, async (req, res) => {
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
      const { status } = req.body;
      const review = await storage.updateReview(id, { status });
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

  const httpServer = createServer(app);
  return httpServer;
}
