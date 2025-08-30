'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share, Bookmark, Eye, Clock, User, Reply, MoreHorizontal, AlertCircle, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Blog, Comment } from '@/lib/types';
import apiService from '@/lib/api';
import { formatRelativeTime, calculateReadTime } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.slug) {
      loadBlog(params.slug as string);
    }
  }, [params.slug]);

  useEffect(() => {
    if (blog?._id) {
      loadComments(params.slug as string);
    }
  }, [blog?._id, params.slug]);

  const loadBlog = async (slug: string) => {
    try {
      const response = await apiService.getBlogBySlug(slug);
      setBlog(response.blog);
      setIsLiked(response.blog.likes.includes(user?._id || ''));
      setLikeCount(response.blog.likeCount);
      setError(null);
    } catch (error) {
      console.error('Failed to load blog:', error);
      setError('Failed to load blog post');
      toast.error('Failed to load blog post');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async (blogSlug: string) => {
    try {
      if (!blog?._id) return;
      const response = await apiService.getComments(blog._id, 1, 50);
      setComments(response.comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like this post');
      return;
    }

    if (!blog) return;

    try {
      const response = await apiService.likeBlog(blog._id);
      setIsLiked(response.isLiked);
      setLikeCount(response.likeCount);
      toast.success(response.isLiked ? 'Post liked!' : 'Like removed');
    } catch (error) {
      console.error('Failed to like blog:', error);
      toast.error('Failed to like post');
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) {
      toast.error('Please write a comment');
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('Please log in to comment');
      return;
    }

    if (!blog) return;

    setIsSubmittingComment(true);
    try {
      const response = await apiService.createComment(blog._id, {
        content: commentContent.trim()
      });
      
      setComments(prev => [response.comment, ...prev]);
      setCommentContent('');
      toast.success('Comment posted successfully!');
      
      // Update blog comment count
      if (blog) {
        setBlog(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev);
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    if (!content.trim()) {
      toast.error('Please write a reply');
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('Please log in to reply');
      return;
    }

    if (!blog) return;

    try {
      const response = await apiService.createComment(blog._id, {
        content: content.trim(),
        parentComment: commentId
      });
      
      // Add reply to the comment
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, replies: [...(comment.replies || []), response.comment] }
          : comment
      ));
      toast.success('Reply posted successfully!');
    } catch (error) {
      console.error('Failed to submit reply:', error);
      toast.error('Failed to post reply');
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  if (isLoading) {
    return <BlogSkeleton />;
  }

  if (error || (!blog && !isLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {error || 'Blog post not found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              The blog post you're looking for doesn't exist or couldn't be loaded.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return <BlogSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative mb-12">
        <div className="aspect-[21/9] overflow-hidden rounded-2xl">
          {blog.coverImage && (
            <img 
              src={blog.coverImage} 
              alt={blog.title}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            {blog.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-white/20 backdrop-blur-sm">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {blog.title}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-white/20">
                <AvatarImage src={blog.author.avatar || ''} alt={blog.author.username} />
                <AvatarFallback>
                  {blog.author.firstName[0]}{blog.author.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{blog.author.firstName} {blog.author.lastName}</p>
                <p className="text-sm opacity-80">@{blog.author.username}</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-white/20" />
            <div className="text-sm">
              <p>{formatRelativeTime(blog.publishedAt || blog.createdAt)}</p>
              <p className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {blog.readTime} min read
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl">
        {/* Interactive Toolbar */}
        <div className="sticky top-4 z-50 mb-8">
          <Card className="inline-flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm border-0 shadow-lg">
            <Button 
              size="sm" 
              variant="ghost" 
              className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
            <Button size="sm" variant="ghost" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              {blog.commentCount}
            </Button>
            <Button size="sm" variant="ghost" className="gap-2">
              <Share className="h-4 w-4" />
              Share
            </Button>
            <Button size="sm" variant="ghost" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Save
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Copy Link</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        </div>

        {/* Blog Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div className="text-xl leading-relaxed text-muted-foreground mb-8">
            {blog.excerpt}
          </div>
          
          <div className="prose-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  return inline ? (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                      <code className="font-mono text-sm" {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                blockquote({ children, ...props }) {
                  return (
                    <blockquote
                      className="border-l-4 border-primary pl-6 py-2 my-6 italic bg-muted/30"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  );
                },
                h1: ({ children, ...props }) => (
                  <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0" {...props}>
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 className="text-2xl font-bold mt-8 mb-4" {...props}>
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 className="text-xl font-semibold mt-6 mb-3" {...props}>
                    {children}
                  </h3>
                ),
                p: ({ children, ...props }) => (
                  <p className="mb-4 leading-relaxed" {...props}>
                    {children}
                  </p>
                ),
                ul: ({ children, ...props }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>
                    {children}
                  </ol>
                ),
                a: ({ children, ...props }) => (
                  <a
                    className="text-primary underline hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {blog.content || 'No content available.'}
            </ReactMarkdown>
          </div>
        </article>

        {/* Author Bio */}
        <Card className="mb-12 p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={blog.author.avatar || ''} alt={blog.author.username} />
              <AvatarFallback>
                {blog.author.firstName[0]}{blog.author.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{blog.author.firstName} {blog.author.lastName}</h3>
              <p className="text-muted-foreground mb-4">
                Passionate developer and writer sharing insights about web development, technology, and innovation.
              </p>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">Follow</Button>
                <div className="text-sm text-muted-foreground">
                  1.2k followers
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Comments ({blog.commentCount})</h2>
          </div>

          {/* Comment Form */}
          {isAuthenticated ? (
            <Card className="mb-6 p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar || ''} alt={user?.username} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      onClick={handleCommentSubmit}
                      disabled={!commentContent.trim() || isSubmittingComment}
                      size="sm"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="mb-6 p-4 bg-muted/50">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Please log in to join the discussion
                </p>
                <Button onClick={() => router.push('/login')}>
                  Log In to Comment
                </Button>
              </div>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem 
                  key={comment._id} 
                  comment={comment}
                  onReply={handleReply}
                  showReplies={showReplies[comment._id] || false}
                  onToggleReplies={() => toggleReplies(comment._id)}
                  isAuthenticated={isAuthenticated}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share your thoughts!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Comment Component
const CommentItem = ({ 
  comment, 
  onReply, 
  showReplies, 
  onToggleReplies,
  isAuthenticated 
}: { 
  comment: Comment; 
  onReply: (commentId: string, content: string) => void;
  showReplies: boolean;
  onToggleReplies: () => void;
  isAuthenticated: boolean;
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    
    setIsSubmittingReply(true);
    await onReply(comment._id, replyContent);
    setReplyContent('');
    setIsSubmittingReply(false);
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={comment.author.avatar || ''} alt={comment.author.username} />
        <AvatarFallback>
          {comment.author.firstName[0]}{comment.author.lastName[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">{comment.author.firstName} {comment.author.lastName}</span>
            <span className="text-sm text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm mb-3">{comment.content}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Heart className="h-3 w-3 mr-1" />
              {comment.likeCount}
            </Button>
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={onToggleReplies}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {comment.replyCount > 0 && !showReplies && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-primary"
                onClick={onToggleReplies}
              >
                View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplies && isAuthenticated && (
          <div className="mt-3 ml-4">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px] mb-2"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleReplySubmit}
                disabled={!replyContent.trim() || isSubmittingReply}
              >
                {isSubmittingReply ? 'Posting...' : 'Reply'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleReplies}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 ml-8 space-y-3">
            {comment.replies.map((reply) => (
              <div key={reply._id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.author.avatar || ''} alt={reply.author.username} />
                  <AvatarFallback>
                    {reply.author.firstName[0]}{reply.author.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{reply.author.firstName} {reply.author.lastName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Loading Skeleton
const BlogSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container max-w-4xl">
      <div className="mb-12">
        <Skeleton className="aspect-[21/9] rounded-2xl mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      
      <div className="space-y-6">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </div>
    </div>
  </div>
);


