'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  MessageCircle, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  EyeOff,
  MoreHorizontal,
  ArrowUpDown,
  Check,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/api';
import { AdminStats, Blog, UserWithStats } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [blogFilter, setBlogFilter] = useState('all');
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    

    loadDashboardData();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadAllBlogs(); // Reload blogs when filter changes
    }
  }, [blogFilter, isAuthenticated, user]);

  // Load all blogs when manage tab is first accessed
  const handleManageTabChange = (value: string) => {
    if (value === 'manage' && allBlogs.length === 0) {
      loadAllBlogs();
    }
  };

  const loadDashboardData = async () => {
    try {
      setError(null);
      const [statsResponse, pendingResponse] = await Promise.all([
        apiService.getAdminDashboard(),
        apiService.getPendingBlogs(1, 50)
      ]);

      // Validate stats response structure
      if (!statsResponse?.stats) {
        throw new Error('Invalid stats response structure');
      }

      setStats(statsResponse.stats);
      setPendingBlogs(pendingResponse?.blogs || []);
      
      // Load recent activity from stats with proper null checks
      const activity = [];
      
      if (statsResponse.stats.recentActivity?.blogs?.length > 0) {
        activity.push(...statsResponse.stats.recentActivity.blogs.map((blog: any) => ({
          id: `blog-${blog._id}`,
          user: {
            name: `${blog.author.firstName} ${blog.author.lastName}`,
            avatar: blog.author.avatar
          },
          action: `submitted "${blog.title}" for review`,
          timestamp: new Date(blog.createdAt).toLocaleDateString(),
          type: 'blog'
        })));
      }
      
      if (statsResponse.stats.recentActivity?.users?.length > 0) {
        activity.push(...statsResponse.stats.recentActivity.users.map((user: any) => ({
          id: `user-${user._id}`,
          user: {
            name: `${user.firstName} ${user.lastName}`,
            avatar: null
          },
          action: 'joined the platform',
          timestamp: new Date(user.createdAt).toLocaleDateString(),
          type: 'user'
        })));
      }
      
      setRecentActivity(activity.slice(0, 10));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Set fallback data to prevent complete failure
      setStats({
        blogs: { total: 0, published: 0, pending: 0, rejected: 0 },
        users: { total: 0 },
        comments: { total: 0 },
        recentActivity: { blogs: [], users: [] },
        analytics: { blogsByCategory: [], monthlyStats: [] }
      });
      setPendingBlogs([]);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveBlog = async (blogId: string) => {
    if (isProcessing) return;
    
    setIsProcessing(blogId);
    try {
      await apiService.approveBlog(blogId);
      setPendingBlogs(prev => prev.filter(blog => blog._id !== blogId));
      setStats(prev => prev ? {
        ...prev,
        blogs: {
          ...prev.blogs,
          pending: prev.blogs.pending - 1,
          published: prev.blogs.published + 1
        }
      } : prev);
      toast.success('Blog approved successfully!');
    } catch (error) {
      console.error('Failed to approve blog:', error);
      toast.error('Failed to approve blog');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectBlog = async (blogId: string, reason: string) => {
    if (isProcessing || !reason.trim()) return;
    
    setIsProcessing(blogId);
    try {
      await apiService.rejectBlog(blogId, { reason });
      setPendingBlogs(prev => prev.filter(blog => blog._id !== blogId));
      setStats(prev => prev ? {
        ...prev,
        blogs: {
          ...prev.blogs,
          pending: prev.blogs.pending - 1,
          rejected: prev.blogs.rejected + 1
        }
      } : prev);
      toast.success('Blog rejected successfully!');
      setRejectionReason('');
      setSelectedBlog(null);
    } catch (error) {
      console.error('Failed to reject blog:', error);
      toast.error('Failed to reject blog');
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePreviewBlog = (blog: Blog) => {
    // Open blog in new tab for preview
    window.open(`/blog/${blog.slug}`, '_blank');
  };

  const loadAllBlogs = async () => {
    try {
      setIsLoadingBlogs(true);
      setError(null);
      const response = await apiService.getAllBlogs(blogFilter);
      
      if (!response?.blogs) {
        throw new Error('Invalid response structure from blogs API');
      }
      
      setAllBlogs(response.blogs);
    } catch (error) {
      console.error('Failed to load all blogs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load all blogs';
      toast.error(errorMessage);
      setError(errorMessage);
      setAllBlogs([]); // Set empty array on error
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  const handleToggleHideBlog = async (blogId: string) => {
    if (isProcessing) return;

    setIsProcessing(blogId);
    try {
      await apiService.toggleBlogVisibility(blogId, true); // Toggle to hidden
      setAllBlogs(prev => prev.map(blog => blog._id === blogId ? { ...blog, isHidden: !blog.isHidden } : blog));
      toast.success('Blog visibility toggled successfully!');
    } catch (error) {
      console.error('Failed to toggle blog visibility:', error);
      toast.error('Failed to toggle blog visibility');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (isProcessing) return;

    setIsProcessing(blogId);
    try {
      await apiService.deleteBlog(blogId);
      setAllBlogs(prev => prev.filter(blog => blog._id !== blogId));
      toast.success('Blog deleted successfully!');
    } catch (error) {
      console.error('Failed to delete blog:', error);
      toast.error('Failed to delete blog');
    } finally {
      setIsProcessing(null);
    }
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the admin dashboard. Admin role required.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.push('/')} variant="outline">
              Go to Home
            </Button>
            <Button onClick={() => router.push('/login')}>
              Login as Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
              <Button onClick={loadDashboardData}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Manage your blog platform and monitor community activity
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadDashboardData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.blogs.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.blogs.published || 0} published, {stats?.blogs.pending || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active community members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.comments.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                Community engagement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.blogs.pending || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6" onValueChange={handleManageTabChange}>
          <TabsList>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="manage">Manage Blogs</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Blog Approvals</CardTitle>
                  <Badge variant="secondary">{pendingBlogs.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {pendingBlogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending blogs to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingBlogs.map((blog) => (
                      <div key={blog._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {blog.coverImage && (
                            <img 
                              src={blog.coverImage} 
                              alt="" 
                              className="h-16 w-16 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium line-clamp-1">{blog.title}</h4>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {blog.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {blog.readTime}m read
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              by {blog.author.firstName} {blog.author.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Submitted {new Date(blog.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePreviewBlog(blog)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveBlog(blog._id)}
                            disabled={isProcessing === blog._id}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {isProcessing === blog._id ? 'Approving...' : 'Approve'}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setSelectedBlog(blog)}
                                disabled={isProcessing === blog._id}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Blog Post</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting "{blog.title}". This will be sent to the author.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reason">Rejection Reason</Label>
                                  <Textarea
                                    id="reason"
                                    placeholder="Please explain why this blog post doesn't meet our guidelines..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="min-h-[100px]"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setRejectionReason('');
                                    setSelectedBlog(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleRejectBlog(blog._id, rejectionReason)}
                                  disabled={!rejectionReason.trim() || isProcessing === blog._id}
                                >
                                  {isProcessing === blog._id ? 'Rejecting...' : 'Reject Blog'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Manage All Blogs</CardTitle>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => setBlogFilter(value)} defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Blogs</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      onClick={() => loadAllBlogs()}
                      disabled={isLoadingBlogs}
                      className="gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingBlogs ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingBlogs ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading blogs...</p>
                  </div>
                ) : allBlogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No blogs found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allBlogs.map((blog) => (
                      <div key={blog._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {blog.coverImage && (
                            <img 
                              src={blog.coverImage} 
                              alt="" 
                              className="h-16 w-16 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium line-clamp-1">{blog.title}</h4>
                              <Badge 
                                variant={blog.status === 'published' ? 'default' : blog.status === 'hidden' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {blog.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {blog.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {blog.readTime}m read
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              by {blog.author.firstName} {blog.author.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {blog.status === 'published' ? `Published ${new Date(blog.publishedAt!).toLocaleDateString()}` : 
                               `Created ${new Date(blog.createdAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePreviewBlog(blog)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button 
                            size="sm" 
                            variant={blog.isHidden ? "default" : "secondary"}
                            onClick={() => handleToggleHideBlog(blog._id)}
                            disabled={isProcessing === blog._id}
                          >
                            <EyeOff className="h-4 w-4 mr-2" />
                            {isProcessing === blog._id ? 'Processing...' : blog.isHidden ? 'Unhide' : 'Hide'}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                disabled={isProcessing === blog._id}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Blog Post</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete "{blog.title}"? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setSelectedBlog(null)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleDeleteBlog(blog._id)}
                                  disabled={isProcessing === blog._id}
                                >
                                  {isProcessing === blog._id ? 'Deleting...' : 'Delete Blog'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                          <AvatarFallback>
                            {activity.user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user.name}</span>
                            {' '}{activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.timestamp}
                          </p>
                        </div>
                        {activity.type === 'blog' && (
                          <Badge variant="secondary" className="text-xs">
                            Blog
                          </Badge>
                        )}
                        {activity.type === 'user' && (
                          <Badge variant="outline" className="text-xs">
                            User
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Blogs by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.analytics?.blogsByCategory && stats.analytics.blogsByCategory.length > 0 ? (
                    <div className="space-y-3">
                      {stats.analytics.blogsByCategory.map((category) => (
                        <div key={category._id} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{category._id}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, (category.count / Math.max(...stats.analytics.blogsByCategory.map(c => c.count))) * 100)}%`
                                }}
                              />
                            </div>
                            <Badge variant="secondary" className="min-w-[3rem] text-center">
                              {category.count}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No category data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Blog Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.analytics?.monthlyStats && stats.analytics.monthlyStats.length > 0 ? (
                    <div className="space-y-3">
                      {stats.analytics.monthlyStats.slice(-6).map((month) => (
                        <div key={`${month._id.year}-${month._id.month}`} className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, (month.count / Math.max(...stats.analytics.monthlyStats.map(m => m.count))) * 100)}%`
                                }}
                              />
                            </div>
                            <Badge variant="secondary" className="min-w-[2.5rem] text-center">
                              {month.count}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No monthly data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Loading Skeleton
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);


