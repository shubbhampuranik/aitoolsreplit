// Shared types for the application
export interface Tool {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  logoUrl?: string;
  url: string;
  gallery?: string[];
  pricingType: string;
  pricingDetails?: string;
  categoryId?: string;
  category?: {
    name: string;
    id: string;
  };
  categories?: Category[];
  submittedBy?: string;
  status: string;
  upvotes: number;
  views: number;
  rating: number;
  ratingCount: number;
  featured: boolean;
  socialLinks?: any;
  faqs?: any;
  prosAndCons?: any;
  features?: string[];
  alternatives?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  slug: string;
  toolCount: number;
}

export interface Review {
  id: string;
  userId: string;
  toolId: string;
  rating: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  reported: boolean;
  reportReason?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Query parameters
export interface ToolsQueryParams {
  search?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sort?: string;
}

export interface ReviewsQueryParams {
  toolId?: string;
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  reported?: boolean;
  limit?: number;
  offset?: number;
}

// Statistics types
export interface AdminStats {
  totalTools: number;
  pendingTools: number;
  approvedTools: number;
  totalUsers: number;
  totalReviews: number;
  pendingReviews: number;
  reportedReviews: number;
}

export interface ToolStats {
  toolsCount: number;
  promptsCount: number;
  coursesCount: number;
  jobsCount: number;
  newsCount: number;
  usersCount: number;
}