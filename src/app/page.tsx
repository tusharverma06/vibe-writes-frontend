"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/blog/blog-card";
import { Blog } from "@/lib/types";
import apiService from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  TrendingUp,
  Users,
  FileText,
  MessageCircle,
  Star,
  Zap,
  BookOpen,
  PenTool,
  Users as UsersIcon,
  RefreshCw,
  Heart,
  Eye,
} from "lucide-react";

export default function HomePage() {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalComments: 0,
    totalLikes: 0,
    totalViews: 0,
  });

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [featuredResponse, recentResponse, trendingResponse, statsResponse] =
        await Promise.all([
          apiService.getBlogs({ limit: 6, sort: "popular" }),
          apiService.getBlogs({ limit: 6, sort: "newest" }),
          apiService.getTrendingBlogs(6, 7), // Get 6 trending blogs from last 7 days
          apiService.getStats() // Get real-time platform stats
        ]);

      setFeaturedBlogs(trendingResponse.blogs); // Use trending blogs as featured
      setRecentBlogs(recentResponse.blogs);

      // Update stats with real-time data from API
      if (statsResponse.success) {
        setStats({
          totalBlogs: statsResponse.data.totalBlogs,
          totalComments: statsResponse.data.totalComments,
          totalLikes: statsResponse.data.totalLikes,
          totalViews: statsResponse.data.totalViews,
        });
      }
    } catch (error) {
      console.error("Failed to load home data:", error);
      // Use mock data for demo
      setFeaturedBlogs(mockFeaturedBlogs);
      setRecentBlogs(mockRecentBlogs);
      setStats({
        totalBlogs: 1250,
        totalComments: 3200,
        totalLikes: 15000,
        totalViews: 50000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900" />
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-slate-100 dark:via-purple-300 dark:to-slate-100 bg-clip-text text-transparent">
              Share Your Knowledge
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Join our community of developers, designers, and creators. Share
              insights, learn from others, and build your professional network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/write">
                  <PenTool className="mr-2 h-5 w-5" />
                  Start Writing
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/blogs">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Blogs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Platform Statistics
              </h2>
              <p className="text-muted-foreground">
                Real-time insights into our community
              </p>
            </div>
            <Button
              variant="outline"
              onClick={loadHomeData}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh Stats
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <FileText className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <div className="text-3xl font-bold mb-2">
                  {stats.totalBlogs.toLocaleString()}
                </div>
                <p className="text-muted-foreground">Blog Posts Published</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Heart className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <div className="text-3xl font-bold mb-2">
                  {stats.totalLikes.toLocaleString()}
                </div>
                <p className="text-muted-foreground">
                  Total Likes Received
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <MessageCircle className="h-12 w-12 mx-auto text-purple-500 mb-4" />
                <div className="text-3xl font-bold mb-2">
                  {stats.totalComments.toLocaleString()}
                </div>
                <p className="text-muted-foreground">Community Discussions</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Eye className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                <div className="text-3xl font-bold mb-2">
                  {stats.totalViews.toLocaleString()}
                </div>
                <p className="text-muted-foreground">Total Page Views</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Featured Stories
              </h2>
              <p className="text-muted-foreground">
                Handpicked content from our community
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/blogs">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} variant="featured" />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">
            Get Started
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <PenTool className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Write a Blog</h3>
                <p className="text-muted-foreground mb-4">
                  Share your knowledge and experiences
                </p>
                <Button asChild size="sm">
                  <Link href="/write">Start Writing</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <BookOpen className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Read Blogs</h3>
                <p className="text-muted-foreground mb-4">
                  Discover insights from the community
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/blogs">Explore</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <TrendingUp className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Trending</h3>
                <p className="text-muted-foreground mb-4">
                  See what&apos;s hot right now
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/trending">View Trends</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <UsersIcon className="h-12 w-12 mx-auto text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Join Community</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with other developers
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Blogs Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Latest Posts
              </h2>
              <p className="text-muted-foreground">
                Fresh content from our community
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/blogs">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} variant="default" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="text-center max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                Ready to Share Your Story?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of developers who are already sharing their
                knowledge and building their professional network.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/write">
                    <PenTool className="mr-2 h-5 w-5" />
                    Start Writing Today
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/register">
                    <Users className="mr-2 h-5 w-5" />
                    Join Community
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

// Loading Skeleton
const HomeSkeleton = () => (
  <div className="min-h-screen bg-background">
    {/* Hero Skeleton */}
    <section className="relative py-20 overflow-hidden">
      <div className="container">
        <div className="text-center max-w-4xl mx-auto">
          <Skeleton className="h-16 w-full mb-6" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-8" />
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    </section>

    {/* Stats Skeleton */}
    <section className="py-16">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="text-center">
              <CardContent className="pt-6">
                <Skeleton className="h-12 w-12 mx-auto mb-4 rounded" />
                <Skeleton className="h-8 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Featured Blogs Skeleton */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    </section>
  </div>
);

// Mock data
const mockFeaturedBlogs: Blog[] = [
  {
    _id: "1",
    title: "The Future of Web Development: Trends to Watch in 2024",
    slug: "future-web-development-2024",
    content: "Content here...",
    excerpt:
      "Exploring the latest trends and technologies shaping the future of web development, from AI integration to new frameworks.",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    author: {
      _id: "1",
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    status: "published",
    tags: ["web development", "trends", "2024"],
    category: "Technology",
    likes: [],
    likeCount: 156,
    views: 8500,
    isHidden: false,
    publishedAt: "2024-01-15T10:00:00.000Z",
    readTime: 8,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
    commentCount: 89,
  },
  {
    _id: "2",
    title: "Building Scalable React Applications with TypeScript",
    slug: "scalable-react-typescript",
    content: "Content here...",
    excerpt:
      "Learn best practices for building large-scale React applications with TypeScript, including architecture patterns and optimization techniques.",
    coverImage:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    author: {
      _id: "2",
      username: "janesmith",
      firstName: "Jane",
      lastName: "Smith",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b371?w=100&h=100&fit=crop&crop=face",
    },
    status: "published",
    tags: ["react", "typescript", "scalability"],
    category: "Development",
    likes: [],
    likeCount: 234,
    views: 12000,
    isHidden: false,
    publishedAt: "2024-01-14T14:30:00.000Z",
    readTime: 12,
    createdAt: "2024-01-14T14:30:00.000Z",
    updatedAt: "2024-01-14T14:30:00.000Z",
    commentCount: 156,
  },
];

const mockRecentBlogs: Blog[] = [
  {
    _id: "3",
    title: "Design Systems: Creating Consistent User Experiences",
    slug: "design-systems-consistency",
    content: "Content here...",
    excerpt:
      "A comprehensive guide to building and maintaining design systems that ensure consistency across your products.",
    coverImage:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=400&fit=crop",
    author: {
      _id: "3",
      username: "alexchen",
      firstName: "Alex",
      lastName: "Chen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    status: "published",
    tags: ["design systems", "ux", "consistency"],
    category: "Design",
    likes: [],
    likeCount: 189,
    views: 9800,
    isHidden: false,
    publishedAt: "2024-01-13T09:15:00.000Z",
    readTime: 10,
    createdAt: "2024-01-13T09:15:00.000Z",
    updatedAt: "2024-01-13T09:15:00.000Z",
    commentCount: 123,
  },
];
