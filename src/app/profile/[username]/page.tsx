'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Twitter, 
  Github, 
  Globe,
  Heart,
  MessageCircle,
  Eye,
  Clock,
  Plus,
  FileText
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogCard } from '@/components/blog/blog-card';
import { Blog } from '@/lib/types';
import apiService from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

interface UserProfile {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  github: string;
  joinedAt: string;
  blogCount: number;
  followerCount: number;
  followingCount: number;
}

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('blogs');

  useEffect(() => {
    if (params.username) {
      loadProfileData(params.username as string);
    }
  }, [params.username]);

  const loadProfileData = async (username: string) => {
    try {
      // In a real app, you'd have an API endpoint to get user profile
      // For now, we'll use mock data
      const mockProfile: UserProfile = {
        _id: '1',
        username: username,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        bio: 'Passionate developer and writer sharing insights about web development, technology, and innovation. Building the future one line of code at a time.',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        twitter: '@johndoe',
        github: 'johndoe',
        joinedAt: '2023-01-15T10:00:00.000Z',
        blogCount: 12,
        followerCount: 1247,
        followingCount: 89
      };

      setProfile(mockProfile);

      // Load user's blogs
      const blogsResponse = await apiService.getBlogsByUser(mockProfile._id, 1, 20);
      setBlogs(blogsResponse.blogs);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      // Use mock data for demo
      setProfile(mockProfile);
      setBlogs(mockBlogs);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // In a real app, you'd call an API to follow/unfollow
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={profile.avatar || ''} alt={profile.username} />
                  <AvatarFallback className="text-4xl">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-3xl font-bold mb-2">{profile.fullName}</h1>
                <p className="text-xl text-muted-foreground mb-4">@{profile.username}</p>
                
                {!isOwnProfile && (
                  <Button 
                    onClick={handleFollow}
                    variant={isFollowing ? 'outline' : 'default'}
                    className="mb-4"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.blogCount}</div>
                    <div className="text-sm text-muted-foreground">Blogs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.followerCount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.followingCount}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>

                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}

                  {profile.twitter && (
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`https://twitter.com/${profile.twitter}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.twitter}
                      </a>
                    </div>
                  )}

                  {profile.github && (
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`https://github.com/${profile.github}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.github}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="blogs">Blogs ({blogs.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="blogs" className="space-y-6">
            {isOwnProfile && (
              <div className="flex justify-end">
                <Button asChild>
                  <Link href="/write">
                    <Plus className="h-4 w-4 mr-2" />
                    Write New Blog
                  </Link>
                </Button>
              </div>
            )}

            {blogs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No blogs yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isOwnProfile 
                      ? "Start writing your first blog post and share your knowledge with the community."
                      : `${profile.firstName} hasn't published any blogs yet.`
                    }
                  </p>
                  {isOwnProfile && (
                    <Button asChild>
                      <Link href="/write">
                        <Plus className="h-4 w-4 mr-2" />
                        Write Your First Blog
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} variant="default" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>More About {profile.firstName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Background</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {profile.bio}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Web Development', 'React', 'TypeScript', 'Node.js', 'UI/UX Design'].map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Connect</h4>
                  <div className="space-y-2">
                    {profile.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    {profile.twitter && (
                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`https://twitter.com/${profile.twitter}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Follow on Twitter
                        </a>
                      </div>
                    )}
                    {profile.github && (
                      <div className="flex items-center gap-2">
                        <Github className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`https://github.com/${profile.github}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View on GitHub
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Loading Skeleton
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container py-8">
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <Skeleton className="h-32 w-32 rounded-full mb-4" />
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-32" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Mock data
const mockProfile: UserProfile = {
  _id: '1',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  bio: 'Passionate developer and writer sharing insights about web development, technology, and innovation. Building the future one line of code at a time.',
  location: 'San Francisco, CA',
  website: 'https://johndoe.dev',
  twitter: '@johndoe',
  github: 'johndoe',
  joinedAt: '2023-01-15T10:00:00.000Z',
  blogCount: 12,
  followerCount: 1247,
  followingCount: 89
};

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
  }
];

