import { 
  AuthResponse, 
  RegisterRequest, 
  LoginRequest, 
  UpdateProfileRequest,
  BlogListResponse,
  BlogResponse,
  BlogQueryParams,
  CreateBlogRequest,
  CommentListResponse,
  CreateCommentRequest,
  AdminStats,
  UserWithStats,
  RejectBlogRequest,
  User,
  Blog,
  Comment,
  ErrorResponse,
  ApiResponse,
  StatsResponse
} from './types';

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL = '/api') {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com/api' 
      : 'http://localhost:5000/api';
    this.token = null;
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data?.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  // Authentication Endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/logout', {
      method: 'POST'
    });
  }

  async getProfile(): Promise<{ success: true; user: User }> {
    return this.request<{ success: true; user: User }>('/auth/me');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<{ success: true; message: string; user: User }> {
    return this.request<{ success: true; message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Blog Endpoints
  async getBlogs(params: BlogQueryParams = {}): Promise<BlogListResponse> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString());
      }
    });
    
    return this.request<BlogListResponse>(`/blogs${query.toString() ? `?${query}` : ''}`);
  }

  async getTrendingBlogs(limit = 5, days = 7): Promise<{ success: true; count: number; blogs: Blog[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      days: days.toString()
    });
    return this.request<{ success: true; count: number; blogs: Blog[] }>(`/blogs/trending?${params}`);
  }

  async searchBlogs(q: string, page = 1, limit = 10): Promise<BlogListResponse> {
    const params = new URLSearchParams({ q, page: page.toString(), limit: limit.toString() });
    return this.request<BlogListResponse>(`/blogs/search?${params}`);
  }

  async getBlogBySlug(slug: string): Promise<BlogResponse> {
    return this.request<BlogResponse>(`/blogs/${slug}`);
  }

  async createBlog(data: CreateBlogRequest): Promise<{ success: true; message: string; blog: Blog }> {
    return this.request<{ success: true; message: string; blog: Blog }>('/blogs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateBlog(id: string, data: Partial<CreateBlogRequest>): Promise<{ success: true; message: string; blog: Blog }> {
    return this.request<{ success: true; message: string; blog: Blog }>(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteBlog(id: string): Promise<{ success: true; message: string }> {
    return this.request<{ success: true; message: string }>(`/blogs/${id}`, {
      method: 'DELETE'
    });
  }

  async likeBlog(id: string): Promise<{ success: true; message: string; likeCount: number; isLiked: boolean }> {
    return this.request<{ success: true; message: string; likeCount: number; isLiked: boolean }>(`/blogs/${id}/like`, {
      method: 'POST'
    });
  }

  async getBlogsByUser(userId: string, page = 1, limit = 10): Promise<BlogListResponse> {
    return this.request<BlogListResponse>(`/blogs/user/${userId}?page=${page}&limit=${limit}`);
  }

  // Comment Endpoints
  async getComments(blogId: string, page = 1, limit = 10, sort = 'newest'): Promise<CommentListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort
    });
    return this.request<CommentListResponse>(`/comments/blog/${blogId}?${params}`);
  }

  async createComment(blogId: string, data: CreateCommentRequest): Promise<{ success: true; message: string; comment: Comment }> {
    return this.request<{ success: true; message: string; comment: Comment }>(`/comments/blog/${blogId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getCommentReplies(commentId: string, page = 1, limit = 5): Promise<{ success: true; count: number; total: number; pages: number; currentPage: number; replies: Comment[] }> {
    return this.request<{ success: true; count: number; total: number; pages: number; currentPage: number; replies: Comment[] }>(`/comments/${commentId}/replies?page=${page}&limit=${limit}`);
  }

  async updateComment(id: string, content: string): Promise<{ success: true; message: string; comment: Comment }> {
    return this.request<{ success: true; message: string; comment: Comment }>(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  }

  async deleteComment(id: string): Promise<{ success: true; message: string }> {
    return this.request<{ success: true; message: string }>(`/comments/${id}`, {
      method: 'DELETE'
    });
  }

  async likeComment(id: string): Promise<{ success: true; message: string; likeCount: number; isLiked: boolean }> {
    return this.request<{ success: true; message: string; likeCount: number; isLiked: boolean }>(`/comments/${id}/like`, {
      method: 'POST'
    });
  }

  // Admin Endpoints (Admin Role Required)
  async getAdminDashboard(): Promise<{ success: true; stats: AdminStats }> {
    return this.request<{ success: true; stats: AdminStats }>('/admin/dashboard');
  }

  async getAdminBlogs(page = 1, limit = 10, status?: string): Promise<BlogListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    return this.request<BlogListResponse>(`/admin/blogs?${params}`);
  }

  async getAllBlogs(status?: string): Promise<BlogListResponse> {
    const params = new URLSearchParams({
      page: '1',
      limit: '100', // Get more blogs for management
      ...(status && status !== 'all' && { status })
    });
    return this.request<BlogListResponse>(`/admin/blogs?${params}`);
  }

  async getPendingBlogs(page = 1, limit = 10): Promise<BlogListResponse> {
    return this.request<BlogListResponse>(`/admin/blogs/pending?page=${page}&limit=${limit}`);
  }

  async approveBlog(id: string): Promise<{ success: true; message: string; blog: Blog }> {
    return this.request<{ success: true; message: string; blog: Blog }>(`/admin/blogs/${id}/approve`, {
      method: 'PUT'
    });
  }

  async rejectBlog(id: string, data: RejectBlogRequest): Promise<{ success: true; message: string; blog: Blog }> {
    return this.request<{ success: true; message: string; blog: Blog }>(`/admin/blogs/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async toggleHideBlog(id: string): Promise<{ success: true; message: string; blog: Blog }> {
    return this.request<{ success: true; message: string; blog: Blog }>(`/admin/blogs/${id}/toggle-hide`, {
      method: 'PUT'
    });
  }

  async deleteAdminBlog(id: string): Promise<{ success: true; message: string }> {
    return this.request<{ success: true; message: string }>(`/admin/blogs/${id}`, {
      method: 'DELETE'
    });
  }

  async getAdminUsers(page = 1, limit = 10): Promise<{ success: true; count: number; total: number; pages: number; currentPage: number; users: UserWithStats[] }> {
    return this.request<{ success: true; count: number; total: number; pages: number; currentPage: number; users: UserWithStats[] }>(`/admin/users?page=${page}&limit=${limit}`);
  }

  // Stats Endpoints
  async getStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>('/stats');
  }

  async toggleBlogVisibility(id: string, hide: boolean): Promise<{ success: true; message: string; blog: Blog }> {
    return this.request<{ success: true; message: string; blog: Blog }>(`/admin/blogs/${id}/toggle-hide`, {
      method: 'PUT',
      body: JSON.stringify({ hide })
    });
  }
}

// Create a singleton instance
const apiService = new ApiService();
export default apiService;