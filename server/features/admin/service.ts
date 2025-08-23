import { Tool, Review, User, AdminStats } from '../../shared/types';
import { storage } from '../../storage';
import { ToolService } from '../tools/service';
import { ReviewService } from '../reviews/service';

export class AdminService {
  private toolService: ToolService;
  private reviewService: ReviewService;

  constructor(private storage: any = storage) {
    this.toolService = new ToolService(storage);
    this.reviewService = new ReviewService(storage);
  }

  async getStats(): Promise<AdminStats> {
    const tools = await this.toolService.getTools();
    const reviews = await this.reviewService.getReviews();
    const users = await this.storage.getAllUsers();

    return {
      totalTools: tools.length,
      pendingTools: tools.filter(t => t.status === 'pending').length,
      approvedTools: tools.filter(t => t.status === 'approved').length,
      totalUsers: users.length,
      totalReviews: reviews.length,
      pendingReviews: reviews.filter(r => r.status === 'pending').length,
      reportedReviews: reviews.filter(r => r.reported).length
    };
  }

  // Tool management
  async getPendingTools(): Promise<Tool[]> {
    return this.toolService.getTools({ status: 'pending' });
  }

  async getApprovedTools(): Promise<Tool[]> {
    return this.toolService.getTools({ status: 'approved' });
  }

  async getRejectedTools(): Promise<Tool[]> {
    return this.toolService.getTools({ status: 'rejected' });
  }

  async approveTool(id: string): Promise<Tool> {
    return this.toolService.updateTool(id, { status: 'approved' });
  }

  async rejectTool(id: string): Promise<Tool> {
    return this.toolService.updateTool(id, { status: 'rejected' });
  }

  async featureTool(id: string, featured: boolean): Promise<Tool> {
    return this.toolService.updateTool(id, { featured });
  }

  async updateTool(id: string, updates: Partial<Tool>): Promise<Tool> {
    return this.toolService.updateTool(id, updates);
  }

  async deleteTool(id: string): Promise<boolean> {
    return this.toolService.deleteTool(id);
  }

  async getToolById(id: string): Promise<Tool | undefined> {
    const tool = await this.toolService.getTool(id);
    if (!tool) return undefined;
    
    // Get tool categories for admin interface
    console.log(`📋 Getting categories for tool ${id}`);
    const categories = await this.storage.getToolCategories(id);
    console.log(`📋 Found ${categories.length} categories:`, categories.map(c => c.name));
    
    const result = { ...tool, categories };
    console.log(`📋 Returning tool with categories:`, result.categories);
    return result;
  }

  // Review management
  async getPendingReviews(): Promise<Review[]> {
    return this.reviewService.getPendingReviews();
  }

  async getApprovedReviews(): Promise<Review[]> {
    return this.reviewService.getApprovedReviews();
  }

  async getRejectedReviews(): Promise<Review[]> {
    return this.reviewService.getRejectedReviews();
  }

  async getReportedReviews(): Promise<Review[]> {
    return this.reviewService.getReportedReviews();
  }

  async approveReview(id: string): Promise<Review> {
    return this.reviewService.approveReview(id);
  }

  async rejectReview(id: string): Promise<Review> {
    return this.reviewService.rejectReview(id);
  }

  async moderateReportedReview(id: string, action: 'keep' | 'remove'): Promise<Review | null> {
    return this.reviewService.handleReportedReview(id, action);
  }

  // User management
  async getAllUsers(): Promise<User[]> {
    return this.storage.getAllUsers();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.storage.getUser(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.storage.deleteUser(id);
  }

  // Search functionality
  async searchTools(query: string): Promise<Tool[]> {
    const tools = await this.toolService.getTools();
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  async searchReviews(query: string): Promise<Review[]> {
    return this.reviewService.searchReviews(query);
  }

  async searchUsers(query: string): Promise<User[]> {
    const users = await this.getAllUsers();
    return users.filter(user =>
      (user.firstName && user.firstName.toLowerCase().includes(query.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(query.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Category management
  async getCategories(): Promise<any[]> {
    return this.storage.getCategories();
  }

  async createCategory(categoryData: any): Promise<any> {
    return this.storage.createCategory(categoryData);
  }

  async updateCategory(id: string, updates: any): Promise<any> {
    return this.storage.updateCategory(id, updates);
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.storage.deleteCategory(id);
  }
}