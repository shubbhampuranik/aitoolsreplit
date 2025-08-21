import { Tool, ToolsQueryParams, ToolStats } from '../../shared/types';
import { storage, DatabaseStorage } from '../../storage';
import { calculateSimilarityScore } from '../../shared/utils';

export class ToolService {
  constructor(private storage: any = storage) {}

  async getTools(params: ToolsQueryParams = {}): Promise<Tool[]> {
    return this.storage.getTools(params);
  }

  async getTool(id: string): Promise<Tool | undefined> {
    return this.storage.getTool(id);
  }

  async createTool(toolData: any): Promise<Tool> {
    return this.storage.createTool(toolData);
  }

  async updateTool(id: string, updates: Partial<Tool>): Promise<Tool> {
    return this.storage.updateTool(id, updates);
  }

  async deleteTool(id: string): Promise<boolean> {
    return this.storage.deleteTool(id);
  }

  async searchTools(query: string, limit: number = 10): Promise<Tool[]> {
    return this.storage.getTools({
      search: query,
      status: 'approved',
      limit
    });
  }

  async calculateToolRating(toolId: string): Promise<{ rating: number; count: number }> {
    return this.storage.calculateToolRating(toolId);
  }

  async getToolUsageStats(toolId: string): Promise<{ useThisCount: number; useAlternativeCount: number }> {
    return this.storage.getToolUsageStats(toolId);
  }

  async getUserUsageVote(toolId: string, userId: string): Promise<{ userVote: string | null }> {
    return this.storage.getUserToolUsageVote(toolId, userId);
  }

  async recordUsageVote(toolId: string, userId: string, voteType: string): Promise<{ userVote: string }> {
    return this.storage.recordToolUsageVote(toolId, userId, voteType);
  }

  async getToolAlternatives(toolId: string): Promise<Tool[]> {
    return this.storage.getToolAlternatives(toolId);
  }

  async addToolAlternative(toolId: string, alternativeId: string, autoSuggested: boolean = false): Promise<void> {
    return this.storage.addToolAlternative(toolId, alternativeId, autoSuggested);
  }

  async removeToolAlternative(toolId: string, alternativeId: string): Promise<void> {
    return this.storage.removeToolAlternative(toolId, alternativeId);
  }

  async getAutoSuggestedAlternatives(toolId: string, limit: number = 5): Promise<Tool[]> {
    const tool = await this.getTool(toolId);
    if (!tool) return [];

    const allTools = await this.getTools({ status: 'approved' });
    const alternatives = [];

    for (const otherTool of allTools) {
      if (otherTool.id === toolId) continue;
      
      const score = calculateSimilarityScore(tool, otherTool);
      if (score >= 0.3) {
        alternatives.push({ ...otherTool, similarityScore: score });
      }
    }

    return alternatives
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }

  async getStats(): Promise<ToolStats> {
    const tools = await this.storage.getTools();
    return {
      toolsCount: tools.filter((t: any) => t.status === 'approved').length,
      promptsCount: 50, // Mock data - replace with actual prompts count
      coursesCount: 30,
      jobsCount: 100,
      newsCount: 75,
      usersCount: 1000 // Mock data - replace with actual user count when available
    };
  }

  async bookmarkTool(userId: string, toolId: string): Promise<{ isBookmarked: boolean }> {
    const result = await this.storage.bookmarkTool(userId, toolId);
    return { isBookmarked: result.bookmarked };
  }

  async getBookmarkCount(toolId: string): Promise<{ count: number }> {
    const count = await this.storage.getBookmarkCount('tool', toolId);
    return { count: count || 0 };
  }

  async getUserInteractions(userId: string, toolId: string): Promise<{ isBookmarked: boolean; isUpvoted: boolean }> {
    const result = await this.storage.getUserInteractions(userId, toolId, 'tool');
    return { 
      isBookmarked: result.bookmarked, 
      isUpvoted: result.vote === 'up' 
    };
  }
}