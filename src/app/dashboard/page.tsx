'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Clock, 
  Eye as EyeIcon, 
  Heart, 
  MessageCircle,
  TrendingUp,
  FileText,
  User,
  Settings,
  MoreHorizontal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import apiService from '@/lib/api';
import { Blog } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [myBlogs, setMyBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, router]);

  const loadDashboardData = async () => {
    try {
      const response = await apiService.getBlogsByUser(user!.id, 1, 50);
      setMyBlogs(response.blogs);
      
      // Calculate stats
      const totalViews = response.blogs.reduce((sum, blog) => sum + blog.views, 0);
      const totalLikes = response.blogs.reduce((sum, blog) => sum + blog.likeCount, 0);
      const totalComments = response.blogs.reduce((sum, blog) => sum + blog.commentCount, 0);
      
      setStats({
        total: response.blogs.length,
        published: response.blogs.filter(b => b.status === 'published').length,
        draft: response.blogs.filter(b => b.status === 'draft').length,
        pending: response.blogs.filter(b => b.status === 'pending').length,
        totalViews,
        totalLikes,
        totalComments
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use mock data for demo
      setMyBlogs(mockBlogs);
      setStats({
        total: 5,
        published: 3,
        draft: 1,
        pending: 1,
        totalViews: 1250,
        totalLikes: 89,
        totalComments: 23
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      try {
        await apiService.deleteBlog(blogId);
        setMyBlogs(prev => prev.filter(blog => blog._id !== blogId));
        // Update stats
        setStats(prev => ({ ...prev, total: prev.total - 1 }));
      } catch (error) {
        console.error('Failed to delete blog:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, {user?.firstName}! Manage your content and track your progress.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.published} published, {stats.draft} drafts
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <EyeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all your blogs
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <p className="text-xs text-muted-foreground">
                Community appreciation
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
              <p className="text-xs text-muted-foreground">
                Reader engagement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card className="border-0 shadow-soft bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="flex-1">
                  <Link href="/write">
                    <Plus className="h-4 w-4 mr-2" />
                    Write New Blog
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href={`/profile/${user?.username}`}>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="blogs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="blogs">My Blogs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="blogs" className="space-y-6">
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Blog Posts</CardTitle>
                  <Badge variant="secondary">{myBlogs.length} total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {myBlogs.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No blogs yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start writing your first blog post and share your knowledge with the community.
                    </p>
                    <Button asChild>
                      <Link href="/write">
                        <Plus className="h-4 w-4 mr-2" />
                        Write Your First Blog
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myBlogs.map((blog) => (
                      <div key={blog._id} className="flex items-center justify-between p-6 border-0 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200 bg-background/50 backdrop-blur-sm">
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
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={
                                  blog.status === 'published' ? 'default' : 
                                  blog.status === 'pending' ? 'secondary' : 'outline'
                                }
                              >
                                {blog.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {blog.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {blog.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {blog.likeCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {blog.commentCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {blog.readTime}m read
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/blog/${blog.slug}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/edit/${blog._id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/blog/${blog.slug}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Post
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/edit/${blog._id}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Post
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteBlog(blog._id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-soft bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
                <CardHeader>
                  <CardTitle>Blog Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Published</span>
                      <Badge variant="default">{stats.published}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Draft</span>
                      <Badge variant="outline">{stats.draft}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pending Review</span>
                      <Badge variant="secondary">{stats.pending}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Views per Post</span>
                      <span className="text-sm font-medium">
                        {stats.total > 0 ? Math.round(stats.totalViews / stats.total) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Likes per Post</span>
                      <span className="text-sm font-medium">
                        {stats.total > 0 ? Math.round(stats.totalLikes / stats.total) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Comments per Post</span>
                      <span className="text-sm font-medium">
                        {stats.total > 0 ? Math.round(stats.totalComments / stats.total) : 0}
                      </span>
                    </div>
                  </div>
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
          <Card key={i} className="border-0 shadow-soft">
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

      <Card className="mb-8 border-0 shadow-soft">
        <CardContent className="p-8">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
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

// Mock data
const mockBlogs: Blog[] = [
  {
    _id: '1',
    title: 'The Future of Web Development: Trends to Watch in 2024',
    slug: 'future-web-development-2024',
    content: 'Content here...',
    excerpt: 'Exploring the latest trends and technologies shaping the future of web development.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    author: {
      _id: '1',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    status: 'published',
    tags: ['web development', 'trends', '2024'],
    category: 'Technology',
    likes: [],
    likeCount: 42,
    views: 1250,
    isHidden: false,
    publishedAt: '2024-01-15T10:00:00.000Z',
    readTime: 8,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    commentCount: 15
  },
  {
    _id: '2',
    title: 'Building Scalable React Applications with TypeScript',
    slug: 'scalable-react-typescript',
    content: 'Content here...',
    excerpt: 'Learn best practices for building large-scale React applications with TypeScript.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    author: {
      _id: '1',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    status: 'published',
    tags: ['react', 'typescript', 'scalability'],
    category: 'Development',
    likes: [],
    likeCount: 67,
    views: 2100,
    isHidden: false,
    publishedAt: '2024-01-14T14:30:00.000Z',
    readTime: 12,
    createdAt: '2024-01-14T14:30:00.000Z',
    updatedAt: '2024-01-14T14:30:00.000Z',
    commentCount: 23
  }
];

