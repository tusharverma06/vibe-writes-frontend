'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Eye, Clock, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Blog } from '@/lib/types';
import { formatRelativeTime, cn } from '@/lib/utils';

interface BlogCardProps {
  blog: Blog;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export function BlogCard({ blog, variant = 'default', className }: BlogCardProps) {
  const isLiked = false; // TODO: Check if current user liked this blog

  if (variant === 'compact') {
    return (
      <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", className)}>
        <div className="flex">
          <div className="w-24 h-24 flex-shrink-0">
            {blog.coverImage && (
              <img 
                src={blog.coverImage} 
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <CardContent className="flex-1 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {blog.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {blog.readTime}m
              </span>
            </div>
            <Link href={`/blog/${blog.slug}`}>
              <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                {blog.title}
              </h3>
            </Link>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={blog.author.avatar || ''} />
                  <AvatarFallback className="text-xs">
                    {blog.author.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {blog.author.firstName} {blog.author.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {blog.likeCount}
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "group overflow-hidden border-0 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
      variant === 'featured' 
        ? "bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-md hover:shadow-primary/25 dark:from-slate-900/90 dark:to-slate-800/60" 
        : "hover:shadow-lg",
      className
    )}>
      {blog.coverImage && (
        <div className={cn(
          "overflow-hidden", 
          variant === 'featured' ? "aspect-[16/9]" : "aspect-[16/9]"
        )}>
          <img 
            src={blog.coverImage} 
            alt={blog.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge 
            variant="secondary" 
            className={cn(
              variant === 'featured' 
                ? "bg-primary/10 text-primary border-primary/20" 
                : ""
            )}
          >
            {blog.category}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {blog.readTime} min read
          </span>
        </div>

        <Link href={`/blog/${blog.slug}`}>
          <h3 className={cn(
            "font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors",
            variant === 'featured' ? "text-xl" : "text-lg"
          )}>
            {blog.title}
          </h3>
        </Link>

        <p className="text-muted-foreground line-clamp-3 mb-4 text-sm">
          {blog.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <Link href={`/profile/${blog.author.username}`} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={blog.author.avatar || ''} alt={blog.author.username} />
              <AvatarFallback>
                {blog.author.firstName[0]}{blog.author.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {blog.author.firstName} {blog.author.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(blog.createdAt)}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-8 px-2 gap-1",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              {blog.likeCount}
            </Button>
            
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
      </CardContent>
    </Card>
  );
}