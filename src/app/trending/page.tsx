'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Clock, Eye, Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogCard } from '@/components/blog/blog-card';
import { Blog } from '@/lib/types';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export default function TrendingPage() {
  const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>([]);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrendingBlogs = async (days = timeRange) => {
    try {
      setIsLoading(true);
      const response = await apiService.getTrendingBlogs(20, days); // Get more blogs for trending page
      setTrendingBlogs(response.blogs);
    } catch (error) {
      console.error('Failed to load trending blogs:', error);
      toast.error('Failed to load trending blogs');
      // Use mock data for demo
      setTrendingBlogs(mockTrendingBlogs);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrendingBlogs();
  }, [timeRange]);

  const handleTimeRangeChange = (days: 7 | 14 | 30) => {
    setTimeRange(days);
  };

  const getTrendingScore = (blog: Blog) => {
    const daysOld = Math.max(1, Math.ceil((Date.now() - new Date(blog.publishedAt || blog.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
    return Math.round((blog.likeCount * 2 + blog.views + blog.commentCount * 3) / daysOld);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trending Blogs</h1>
              <p className="text-muted-foreground">
                Discover the most popular content based on engagement and recent activity
              </p>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Time Range:</span>
          </div>
          <div className="flex gap-2">
            {[
              { days: 7, label: 'Last 7 days' },
              { days: 14, label: 'Last 2 weeks' },
              { days: 30, label: 'Last month' }
            ].map(({ days, label }) => (
              <Button
                key={days}
                variant={timeRange === days ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeRangeChange(days as 7 | 14 | 30)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Trending Algorithm Info */}
        <Card className="mb-8 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">How Trending Works</h3>
                <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                  Trending score is calculated using: <strong>(Likes × 2 + Views + Comments × 3) ÷ (Days since published + 1)</strong>
                  <br />
                  This ensures fresh, engaging content rises to the top while maintaining quality.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trending Blogs */}
        {isLoading ? (
          <TrendingSkeleton />
        ) : (
          <div className="space-y-6">
            {trendingBlogs.length > 0 ? (
              trendingBlogs.map((blog, index) => (
                <Card key={blog._id} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      {blog.coverImage && (
                        <div className="aspect-video md:aspect-square overflow-hidden">
                          <img 
                            src={blog.coverImage} 
                            alt={blog.title}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      )}
                    </div>
                    <CardContent className="flex-1 p-6">
                      {/* Trending Rank */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          #{index + 1} Trending
                        </Badge>
                        <Badge variant="outline">{blog.category}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {blog.readTime}m read
                        </span>
                      </div>

                      {/* Title and Excerpt */}
                      <h2 className="text-2xl font-bold mb-2 hover:text-primary transition-colors cursor-pointer">
                        {blog.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>

                      {/* Author and Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            {blog.author.firstName[0]}{blog.author.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {blog.author.firstName} {blog.author.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1" title="Trending Score">
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                            <span className="font-semibold text-amber-600">
                              {getTrendingScore(blog)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {blog.likeCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {blog.commentCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {blog.views}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{blog.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No trending blogs found</h3>
                <p className="text-muted-foreground">
                  Check back later for trending content in the selected time range.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading Skeleton
const TrendingSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 5 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <Skeleton className="aspect-video md:aspect-square w-full" />
          </div>
          <CardContent className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    ))}
  </div>
);

// Mock data for demo
const mockTrendingBlogs: Blog[] = [
  {
    _id: '1',
    title: 'The Future of Web Development: AI-Powered Code Generation',
    slug: 'future-web-development-ai-code-generation',
    content: 'Content here...',
    excerpt: 'Exploring how AI is revolutionizing the way we write code, from auto-completion to full application generation.',
    coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
    author: {
      _id: '1',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    status: 'published',
    tags: ['ai', 'web development', 'coding', 'future'],
    category: 'Technology',
    likes: [],
    likeCount: 324,
    views: 12500,
    isHidden: false,
    publishedAt: '2024-01-15T10:00:00.000Z',
    readTime: 12,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    commentCount: 89
  },
  {
    _id: '2',
    title: 'React Server Components: A Game Changer for Performance',
    slug: 'react-server-components-performance',
    content: 'Content here...',
    excerpt: 'Deep dive into React Server Components and how they are transforming the way we build high-performance web applications.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    author: {
      _id: '2',
      username: 'janesmith',
      firstName: 'Jane',
      lastName: 'Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b371?w=100&h=100&fit=crop&crop=face'
    },
    status: 'published',
    tags: ['react', 'performance', 'server components'],
    category: 'Development',
    likes: [],
    likeCount: 267,
    views: 8900,
    isHidden: false,
    publishedAt: '2024-01-14T14:30:00.000Z',
    readTime: 15,
    createdAt: '2024-01-14T14:30:00.000Z',
    updatedAt: '2024-01-14T14:30:00.000Z',
    commentCount: 156
  }
];
