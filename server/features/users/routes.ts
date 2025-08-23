import { Router } from 'express';
import { UserService } from './service';
import { isAuthenticated } from '../../replitAuth';
import { storage } from '../../storage';

export const createUserRoutes = (storageInstance: any = storage): Router => {
  const router = Router();
  const userService = new UserService(storageInstance);

  // Get user interactions for a specific item
  router.get('/interactions/:itemId', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const interactions = await userService.getUserInteractions(userId, req.params.itemId);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching user interactions:", error);
      res.status(500).json({ message: "Failed to fetch user interactions" });
    }
  });

  // Get user bookmarks
  router.get('/bookmarks', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { itemType } = req.query;
      const bookmarks = await userService.getUserBookmarks(userId, itemType as string);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching user bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch user bookmarks" });
    }
  });

  // Get current user profile
  router.get('/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await userService.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Update user profile
  router.put('/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await userService.updateUser(userId, req.body);
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  return router;
};