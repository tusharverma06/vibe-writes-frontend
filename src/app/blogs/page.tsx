'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, SortDesc, Grid, List, Loader2, AlertCircle, Clock, Eye, Heart, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlogCard } from '@/components/blog/blog-card';
import { Blog, BlogQueryParams } from '@/lib/types';
import apiService from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

const CATEGORIES = [
  'Technology',
  'Development',
  'Design',
  'Business',
  'Startup',
  'Career',
  'Tutorial',
  'Opinion',
  'News',
  'Review'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' }
];

export default function BlogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL state management
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Update URL when filters change
  const updateURL = useCallback((params: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        newSearchParams.set(key, value);
      }
    });

    // Keep existing params that aren't being updated
    searchParams.forEach((value, key) => {
      if (!params.hasOwnProperty(key) && value) {
        newSearchParams.set(key, value);
      }
    });

    const newURL = newSearchParams.toString() 
      ? `${window.location.pathname}?${newSearchParams.toString()}`
      : window.location.pathname;
    
    router.replace(newURL);
  }, [searchParams, router]);

  // Load blogs
  const loadBlogs = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const params: BlogQueryParams = {
        page,
        limit: 12,
        ...(selectedCategory && { category: selectedCategory }),
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(',') }),
        sort: selectedSort as any
      };

      const response = await apiService.getBlogs(params);
      
      if (append) {
        setBlogs(prev => [...prev, ...response.blogs]);
      } else {
        setBlogs(response.blogs);
      }
      
      setTotalPages(response.pages);
      setTotalBlogs(response.total);
      setCurrentPage(page);

      // Extract unique tags from blogs for filter options
      const allTags = response.blogs.flatMap(blog => blog.tags);
      const uniqueTags = Array.from(new Set([...availableTags, ...allTags])).sort();
      setAvailableTags(uniqueTags);

    } catch (error) {
      console.error('Failed to load blogs:', error);
      setError('Failed to load blogs. Please try again.');
      toast.error('Failed to load blogs');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, debouncedSearchQuery, selectedTags, selectedSort, availableTags]);

  // Initial load and filter changes
  useEffect(() => {
    loadBlogs(1, false);
  }, [loadBlogs]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURL({ search: value || undefined });
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateURL({ category: category || undefined });
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    updateURL({ sort: sort === 'newest' ? undefined : sort });
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    updateURL({ tags: newTags.length > 0 ? newTags.join(',') : undefined });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
    setSelectedSort('newest');
    router.replace('/blogs');
  };

  // Load more blogs (infinite scroll)
  const loadMoreBlogs = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      loadBlogs(currentPage + 1, true);
    }
  };

  // Memoized filter indicators
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedSearchQuery) count++;
    if (selectedCategory) count++;
    if (selectedTags.length > 0) count++;
    if (selectedSort !== 'newest') count++;
    return count;
  }, [debouncedSearchQuery, selectedCategory, selectedTags, selectedSort]);

  if (error && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => loadBlogs(1, false)}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Explore Blogs</h1>
              <p className="text-muted-foreground">
                Discover {totalBlogs.toLocaleString()} articles from our community
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-soft bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 border-0 bg-background/50 backdrop-blur-sm shadow-soft focus:shadow-medium transition-all duration-200"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Select value={selectedSort} onValueChange={handleSortChange}>
                    <SelectTrigger>
                      <SortDesc className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters ({activeFiltersCount})
                  </Button>
                )}
              </div>

              {/* Tag Filters */}
              {availableTags.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter by tags:
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                    {availableTags.slice(0, 20).map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "secondary"}
                        className="cursor-pointer hover:bg-primary/80 transition-all duration-200 hover:scale-105 hover:shadow-soft border-0"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {isLoading ? (
          <BlogsPageSkeleton viewMode={viewMode} />
        ) : blogs.length > 0 ? (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {blogs.map((blog) => (
                <BlogCard 
                  key={blog._id} 
                  blog={blog} 
                  variant={viewMode === 'list' ? 'compact' : 'default'} 
                />
              ))}
            </div>

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="text-center mt-8">
                <Button 
                  onClick={loadMoreBlogs} 
                  disabled={isLoadingMore}
                  size="lg"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Load More (${totalBlogs - blogs.length} remaining)`
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No blogs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading Skeleton
const BlogsPageSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => (
  <>
    {/* Header Skeleton */}
    <div className="mb-8">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-48" />
    </div>

    {/* Filter Card Skeleton */}
    <Card className="mb-8 border-0 shadow-soft bg-card/50 backdrop-blur-sm">
      <CardContent className="p-8">
        <Skeleton className="h-10 w-full mb-4" />
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16" />
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Blog Cards Skeleton */}
    <div className={`grid gap-6 ${
      viewMode === 'grid' 
        ? 'md:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1'
    }`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
          <Skeleton className="aspect-video w-full rounded-t-xl" />
          <CardContent className="p-4">
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </>
);


