import { Router } from 'express';
import { ToolService } from './service';
import { isAuthenticated } from '../../replitAuth';
import { storage } from '../../storage';

export const createToolRoutes = (storageInstance: any = storage): Router => {
  const router = Router();
  const toolService = new ToolService(storageInstance);

  // Get all tools with filtering
  router.get('/', async (req, res) => {
    try {
      const {
        search,
        category,
        status = 'approved',
        featured,
        sort = 'newest',
        limit = 20,
        offset = 0
      } = req.query;

      const tools = await toolService.getTools({
        search: search as string,
        category: category as string,
        status: status as string,
        featured: featured ? featured === 'true' : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        sort: sort as string
      });

      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  // Get tool by ID
  router.get('/:id', async (req, res) => {
    try {
      const tool = await toolService.getTool(req.params.id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      console.error("Error fetching tool:", error);
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  // Create tool (protected)
  router.post('/', isAuthenticated, async (req, res) => {
    try {
      const tool = await toolService.createTool({
        ...req.body,
        submittedBy: req.user?.claims?.sub
      });
      res.status(201).json(tool);
    } catch (error) {
      console.error("Error creating tool:", error);
      res.status(500).json({ message: "Failed to create tool" });
    }
  });

  // Update tool (protected)
  router.put('/:id', isAuthenticated, async (req, res) => {
    try {
      const tool = await toolService.updateTool(req.params.id, req.body);
      res.json(tool);
    } catch (error) {
      console.error("Error updating tool:", error);
      res.status(500).json({ message: "Failed to update tool" });
    }
  });

  // Delete tool (protected)
  router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
      const success = await toolService.deleteTool(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.json({ message: "Tool deleted successfully" });
    } catch (error) {
      console.error("Error deleting tool:", error);
      res.status(500).json({ message: "Failed to delete tool" });
    }
  });

  // Tool rating
  router.get('/:id/rating', async (req, res) => {
    try {
      const rating = await toolService.calculateToolRating(req.params.id);
      res.json(rating);
    } catch (error) {
      console.error("Error calculating tool rating:", error);
      res.status(500).json({ message: "Failed to calculate rating" });
    }
  });

  // Vote on a tool
  router.post('/:id/vote', async (req, res) => {
    try {
      const { direction } = req.body;
      const toolId = req.params.id;
      
      if (!['up', 'down'].includes(direction)) {
        return res.status(400).json({ message: 'Invalid vote direction' });
      }

      // For now, just return success - can implement actual voting logic later
      res.json({ success: true, message: 'Vote recorded' });
    } catch (error) {
      console.error('Error voting on tool:', error);
      res.status(500).json({ message: 'Failed to vote on tool' });
    }
  });

  // Bookmark a tool
  router.post('/:id/bookmark', async (req, res) => {
    try {
      const toolId = req.params.id;
      
      // For now, just return success - can implement actual bookmarking logic later
      res.json({ success: true, message: 'Bookmark toggled' });
    } catch (error) {
      console.error('Error bookmarking tool:', error);
      res.status(500).json({ message: 'Failed to bookmark tool' });
    }
  });

  // Usage statistics
  router.get('/:id/usage-stats', async (req, res) => {
    try {
      const stats = await toolService.getToolUsageStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ message: "Failed to fetch usage stats" });
    }
  });

  // User usage vote
  router.get('/:id/user-usage-vote', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const vote = await toolService.getUserUsageVote(req.params.id, userId);
      res.json(vote);
    } catch (error) {
      console.error("Error fetching user usage vote:", error);
      res.status(500).json({ message: "Failed to fetch usage vote" });
    }
  });

  // Record usage vote
  router.post('/:id/usage-vote', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { voteType } = req.body;
      const result = await toolService.recordUsageVote(req.params.id, userId, voteType);
      res.json(result);
    } catch (error) {
      console.error("Error recording usage vote:", error);
      res.status(500).json({ message: "Failed to record usage vote" });
    }
  });

  // Tool alternatives
  router.get('/:id/alternatives', async (req, res) => {
    try {
      const alternatives = await toolService.getToolAlternatives(req.params.id);
      res.json(alternatives);
    } catch (error) {
      console.error("Error fetching tool alternatives:", error);
      res.status(500).json({ message: "Failed to fetch alternatives" });
    }
  });

  // Add tool alternative (protected)
  router.post('/:id/alternatives', isAuthenticated, async (req, res) => {
    try {
      const { alternativeId, autoSuggested = false } = req.body;
      await toolService.addToolAlternative(req.params.id, alternativeId, autoSuggested);
      res.json({ message: "Alternative added successfully" });
    } catch (error) {
      console.error("Error adding tool alternative:", error);
      res.status(500).json({ message: "Failed to add alternative" });
    }
  });

  // Remove tool alternative (protected)
  router.delete('/:id/alternatives/:alternativeId', isAuthenticated, async (req, res) => {
    try {
      await toolService.removeToolAlternative(req.params.id, req.params.alternativeId);
      res.json({ message: "Alternative removed successfully" });
    } catch (error) {
      console.error("Error removing tool alternative:", error);
      res.status(500).json({ message: "Failed to remove alternative" });
    }
  });

  // Get auto-suggested alternatives
  router.get('/:id/auto-alternatives', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const alternatives = await toolService.getAutoSuggestedAlternatives(req.params.id, limit);
      res.json(alternatives);
    } catch (error) {
      console.error("Error fetching auto-suggested alternatives:", error);
      res.status(500).json({ message: "Failed to fetch auto-suggested alternatives" });
    }
  });

  // Bookmark tool
  router.post('/:id/bookmark', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const result = await toolService.bookmarkTool(userId, req.params.id);
      res.json(result);
    } catch (error) {
      console.error("Error bookmarking tool:", error);
      res.status(500).json({ message: "Failed to bookmark tool" });
    }
  });

  // AI-powered data fetching endpoint
  router.post('/fetch-data', isAuthenticated, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ 
          success: false, 
          error: 'URL is required' 
        });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid URL format' 
        });
      }

      console.log(`Starting AI analysis for URL: ${url}`);
      
      // Import AI analyzer dynamically to avoid import issues
      const { AIToolAnalyzer } = await import('../../aiToolAnalyzer');
      const analyzer = new AIToolAnalyzer();
      
      const result = await analyzer.analyzeToolFromUrl(url);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          error: result.error || 'Failed to analyze tool'
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error fetching tool data:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch tool data'
      });
    }
  });

  return router;
};