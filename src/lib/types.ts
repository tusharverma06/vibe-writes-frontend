// User Data Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string; // Virtual field
  avatar: string | null;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
}

// Blog Data Types
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string | null;
  author: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'hidden';
  tags: string[];
  category: string;
  likes: string[]; // Array of user IDs
  likeCount: number; // Virtual field
  views: number;
  isHidden: boolean;
  rejectionReason?: string;
  publishedAt: string | null;
  readTime: number; // Minutes
  createdAt: string;
  updatedAt: string;
  commentCount: number; // Virtual field populated separately
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  excerpt?: string;
  coverImage?: string;
  status?: 'draft' | 'pending';
}

export interface BlogListResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  blogs: Blog[];
}

export interface BlogResponse {
  success: boolean;
  blog: Blog;
}

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string; // Comma-separated
  search?: string;
  sort?: 'newest' | 'oldest' | 'popular' | 'trending';
}

// Comment Data Types
export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  blog: string; // Blog ID
  parentComment: string | null;
  likes: string[]; // Array of user IDs
  likeCount: number; // Virtual field
  isHidden: boolean;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[]; // Nested replies
  replyCount: number; // Virtual field
}

export interface CreateCommentRequest {
  content: string;
  parentComment?: string; // For replies
}

export interface CommentListResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  comments: Comment[];
}

// Admin Data Types
export interface AdminStats {
  blogs: {
    total: number;
    published: number;
    pending: number;
    rejected: number;
  };
  users: {
    total: number;
  };
  comments: {
    total: number;
  };
  recentActivity: {
    blogs: Array<{
      _id: string;
      title: string;
      status: string;
      createdAt: string;
      author: {
        username: string;
        firstName: string;
        lastName: string;
      };
    }>;
    users: Array<{
      _id: string;
      username: string;
      firstName: string;
      lastName: string;
      createdAt: string;
    }>;
  };
  analytics: {
    blogsByCategory: Array<{
      _id: string;
      count: number;
    }>;
    monthlyStats: Array<{
      _id: {
        year: number;
        month: number;
      };
      count: number;
    }>;
  };
}

export interface UserWithStats extends User {
  blogStats: {
    total: number;
    published: number;
  };
}

export interface RejectBlogRequest {
  reason: string;
}

// Stats Data Types
export interface StatsResponse {
  success: boolean;
  data: {
    totalBlogs: number;
    totalComments: number;
    totalLikes: number;
    totalViews: number;
    breakdown: {
      blogLikes: number;
      commentLikes: number;
    };
  };
}

// Error Response Format
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>; // For validation errors
  stack?: string; // Only in development
}

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}