import { Review, ReviewsQueryParams } from '../../shared/types';
import { storage } from '../../storage';

export class ReviewService {
  constructor(private storage: any = storage) {}

  async getReviews(toolId?: string, status?: string): Promise<Review[]> {
    return this.storage.getReviews(toolId, status);
  }

  async getReview(id: string): Promise<Review | undefined> {
    return this.storage.getReview(id);
  }

  async createReview(reviewData: any): Promise<Review> {
    return this.storage.createReview(reviewData);
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    return this.storage.updateReview(id, updates);
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.storage.deleteReview(id);
  }

  async approveReview(id: string): Promise<Review> {
    return this.updateReview(id, { status: 'approved' });
  }

  async rejectReview(id: string): Promise<Review> {
    return this.updateReview(id, { status: 'rejected' });
  }

  async reportReview(id: string, reason: string): Promise<Review> {
    return this.updateReview(id, { 
      reported: true, 
      reportReason: reason 
    });
  }

  async getReportedReviews(): Promise<Review[]> {
    return this.storage.getReportedReviews();
  }

  async handleReportedReview(id: string, action: 'keep' | 'remove'): Promise<Review> {
    if (action === 'remove') {
      await this.deleteReview(id);
      return null;
    } else {
      return this.updateReview(id, { 
        reported: false, 
        reportReason: undefined 
      });
    }
  }

  async getPendingReviews(): Promise<Review[]> {
    return this.getReviews(undefined, 'pending');
  }

  async getApprovedReviews(toolId?: string): Promise<Review[]> {
    return this.getReviews(toolId, 'approved');
  }

  async getRejectedReviews(): Promise<Review[]> {
    return this.getReviews(undefined, 'rejected');
  }

  async searchReviews(query: string): Promise<Review[]> {
    const allReviews = await this.getReviews();
    return allReviews.filter(review => 
      review.title.toLowerCase().includes(query.toLowerCase()) ||
      review.content.toLowerCase().includes(query.toLowerCase()) ||
      (review.author?.firstName && review.author.firstName.toLowerCase().includes(query.toLowerCase())) ||
      (review.author?.lastName && review.author.lastName.toLowerCase().includes(query.toLowerCase()))
    );
  }

  async getReviewStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    reported: number;
  }> {
    const allReviews = await this.getReviews();
    const reportedReviews = await this.getReportedReviews();
    
    return {
      total: allReviews.length,
      pending: allReviews.filter(r => r.status === 'pending').length,
      approved: allReviews.filter(r => r.status === 'approved').length,
      rejected: allReviews.filter(r => r.status === 'rejected').length,
      reported: reportedReviews.length
    };
  }
}