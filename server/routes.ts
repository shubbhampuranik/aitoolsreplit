import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertToolSchema, insertPromptSchema, insertCourseSchema, insertJobSchema, insertPostSchema, insertCommentSchema } from "@shared/schema";
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
        featured: featured === 'true',
        status: status as string,
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
