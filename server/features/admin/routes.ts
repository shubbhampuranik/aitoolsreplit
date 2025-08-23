import { Router } from 'express';
import { AdminService } from './service';
import { isAuthenticated } from '../../replitAuth';
import { storage } from '../../storage';

export const createAdminRoutes = (storageInstance: any = storage): Router => {
  const router = Router();
  const adminService = new AdminService(storageInstance);

  // Middleware to ensure only admins can access these routes
  const isAdmin = async (req: any, res: any, next: any) => {
    // TODO: Implement proper admin role checking
    // For now, allow all authenticated users
    next();
  };

  // Get admin statistics
  router.get('/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await adminService.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  // Tool management endpoints
  router.get('/tools', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status, search } = req.query;
      
      let tools;
      if (search) {
        tools = await adminService.searchTools(search as string);
      } else if (status === 'pending') {
        tools = await adminService.getPendingTools();
      } else if (status === 'approved') {
        tools = await adminService.getApprovedTools();
      } else if (status === 'rejected') {
        tools = await adminService.getRejectedTools();
      } else {
        tools = await adminService.getApprovedTools(); // Default
      }
      
      res.json(tools);
    } catch (error) {
      console.error("Error fetching admin tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  router.post('/tools/:id/approve', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const tool = await adminService.approveTool(req.params.id);
      res.json(tool);
    } catch (error) {
      console.error("Error approving tool:", error);
      res.status(500).json({ message: "Failed to approve tool" });
    }
  });

  router.post('/tools/:id/reject', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const tool = await adminService.rejectTool(req.params.id);
      res.json(tool);
    } catch (error) {
      console.error("Error rejecting tool:", error);
      res.status(500).json({ message: "Failed to reject tool" });
    }
  });

  router.post('/tools/:id/feature', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { featured } = req.body;
      const tool = await adminService.featureTool(req.params.id, featured);
      res.json(tool);
    } catch (error) {
      console.error("Error featuring tool:", error);
      res.status(500).json({ message: "Failed to feature tool" });
    }
  });

  // Tool CRUD operations
  router.get('/tools/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const tool = await adminService.getToolById(req.params.id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      res.json(tool);
    } catch (error) {
      console.error("Error fetching tool:", error);
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  router.put('/tools/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const tool = await adminService.updateTool(req.params.id, req.body);
      res.json(tool);
    } catch (error) {
      console.error("Error updating tool:", error);
      res.status(500).json({ message: "Failed to update tool" });
    }
  });

  router.delete('/tools/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await adminService.deleteTool(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.json({ message: "Tool deleted successfully" });
    } catch (error) {
      console.error("Error deleting tool:", error);
      res.status(500).json({ message: "Failed to delete tool" });
    }
  });

  // Review management endpoints
  router.get('/reviews', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status, search, reported } = req.query;
      
      let reviews;
      if (search) {
        reviews = await adminService.searchReviews(search as string);
      } else if (reported === 'true') {
        reviews = await adminService.getReportedReviews();
      } else if (status === 'pending') {
        reviews = await adminService.getPendingReviews();
      } else if (status === 'approved') {
        reviews = await adminService.getApprovedReviews();
      } else if (status === 'rejected') {
        reviews = await adminService.getRejectedReviews();
      } else {
        reviews = await adminService.getPendingReviews(); // Default
      }
      
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  router.post('/reviews/:id/approve', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const review = await adminService.approveReview(req.params.id);
      res.json(review);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  router.post('/reviews/:id/reject', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const review = await adminService.rejectReview(req.params.id);
      res.json(review);
    } catch (error) {
      console.error("Error rejecting review:", error);
      res.status(500).json({ message: "Failed to reject review" });
    }
  });

  router.post('/reviews/:id/moderate', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { action } = req.body; // 'keep' or 'remove'
      const review = await adminService.moderateReportedReview(req.params.id, action);
      res.json(review || { message: "Review removed successfully" });
    } catch (error) {
      console.error("Error moderating review:", error);
      res.status(500).json({ message: "Failed to moderate review" });
    }
  });

  // User management endpoints
  router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { search } = req.query;
      
      let users;
      if (search) {
        users = await adminService.searchUsers(search as string);
      } else {
        users = await adminService.getAllUsers();
      }
      
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  router.delete('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await adminService.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Category management endpoints
  router.get('/categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const categories = await adminService.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  router.post('/categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const category = await adminService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  router.put('/categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const category = await adminService.updateCategory(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  router.delete('/categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await adminService.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Reported reviews endpoint
  router.get('/reported-reviews', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const reviews = await adminService.getReportedReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reported reviews:", error);
      res.status(500).json({ message: "Failed to fetch reported reviews" });
    }
  });

  return router;
};