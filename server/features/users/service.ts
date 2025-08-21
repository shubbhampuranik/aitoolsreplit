import { User } from '../../shared/types';
import { storage } from '../../storage';

export class UserService {
  constructor(private storage: any = storage) {}

  async getUserInteractions(userId: string, toolId: string): Promise<{ isBookmarked: boolean; isUpvoted: boolean }> {
    const result = await this.storage.getUserInteractions(userId, toolId, 'tool');
    return { 
      isBookmarked: result.bookmarked, 
      isUpvoted: result.vote === 'up' 
    };
  }

  async bookmarkItem(userId: string, itemType: string, itemId: string): Promise<{ isBookmarked: boolean }> {
    const result = await this.storage.bookmarkTool(userId, itemId);
    return { isBookmarked: result.bookmarked };
  }

  async getUserBookmarks(userId: string, itemType?: string): Promise<any[]> {
    return this.storage.getUserBookmarks(userId, itemType);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.storage.getUser(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.storage.getAllUsers();
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return this.storage.updateUser(id, updates);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.storage.deleteUser(id);
  }

  async getUserCount(): Promise<number> {
    const users = await this.storage.getAllUsers();
    return users.length;
  }
}