import { Router } from 'express';
import { ReviewService } from './service';
import { isAuthenticated } from '../../replitAuth';
import { storage } from '../../storage';

export const createReviewRoutes = (storageInstance: any = storage): Router => {
  const router = Router();
  const reviewService = new ReviewService(storageInstance);

  // Get reviews for a specific tool
  router.get('/', async (req, res) => {
    try {
      const { toolId, status } = req.query;
      const reviews = await reviewService.getReviews(
        toolId as string,
        status as string
      );
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get review by ID
  router.get('/:id', async (req, res) => {
    try {
      const review = await reviewService.getReview(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ message: "Failed to fetch review" });
    }
  });

  // Create review (protected)
  router.post('/', isAuthenticated, async (req, res) => {
    try {
      const review = await reviewService.createReview({
        ...req.body,
        userId: req.user?.claims?.sub,
        status: 'pending'
      });
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Update review (protected)
  router.put('/:id', isAuthenticated, async (req, res) => {
    try {
      const review = await reviewService.updateReview(req.params.id, req.body);
      res.json(review);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Delete review (protected)
  router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
      const success = await reviewService.deleteReview(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Approve review (protected)
  router.post('/:id/approve', isAuthenticated, async (req, res) => {
    try {
      const review = await reviewService.approveReview(req.params.id);
      res.json(review);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  // Reject review (protected)
  router.post('/:id/reject', isAuthenticated, async (req, res) => {
    try {
      const review = await reviewService.rejectReview(req.params.id);
      res.json(review);
    } catch (error) {
      console.error("Error rejecting review:", error);
      res.status(500).json({ message: "Failed to reject review" });
    }
  });

  // Report review (protected)
  router.post('/:id/report', isAuthenticated, async (req, res) => {
    try {
      const { reason } = req.body;
      const review = await reviewService.reportReview(req.params.id, reason);
      res.json(review);
    } catch (error) {
      console.error("Error reporting review:", error);
      res.status(500).json({ message: "Failed to report review" });
    }
  });

  // Handle reported review (protected)
  router.post('/:id/moderate', isAuthenticated, async (req, res) => {
    try {
      const { action } = req.body; // 'keep' or 'remove'
      const review = await reviewService.handleReportedReview(req.params.id, action);
      res.json(review);
    } catch (error) {
      console.error("Error moderating review:", error);
      res.status(500).json({ message: "Failed to moderate review" });
    }
  });

  return router;
};