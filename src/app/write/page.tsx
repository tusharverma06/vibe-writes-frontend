'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlogHeader } from '@/components/BlogHeader';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { PreviewModal } from '@/components/PreviewModal';
import { useAuth } from '@/contexts/auth-context';
import apiService from '@/lib/api';
import { toast } from 'sonner';
import { calculateReadTime } from '@/lib/utils';

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Load draft from localStorage on mount
    const savedDraft = localStorage.getItem('currentBlogPost');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setTags(draft.tags || []);
        setCategory(draft.category || '');
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [isAuthenticated, router]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast.error('Please add a title before saving');
      return;
    }

    setIsLoading(true);
    try {
      const blogData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: content.trim().substring(0, 200) + (content.trim().length > 200 ? '...' : ''),
        category: category || 'General',
        tags,
        status: 'draft' as const,
      };

      await apiService.createBlog(blogData);
      toast.success('Draft saved successfully!');
      
      // Store in localStorage as backup
      localStorage.setItem('currentBlogPost', JSON.stringify({
        title,
        content,
        tags,
        category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      toast.error('Failed to save draft');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [title, content, tags, category]);

  const handlePreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const handlePublish = useCallback(async () => {
    if (!title.trim()) {
      toast.error('Please add a title before publishing');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please add some content before publishing');
      return;
    }

    if (!category) {
      toast.error('Please select a category before publishing');
      return;
    }

    setIsLoading(true);
    try {
      const blogData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: content.trim().substring(0, 200) + (content.trim().length > 200 ? '...' : ''),
        category,
        tags,
        status: 'pending' as const, // Submit for review
      };

      const response = await apiService.createBlog(blogData);
      toast.success('Blog submitted for review successfully!');
      
      // Clear form
      setTitle('');
      setContent('');
      setTags([]);
      setCategory('');
      localStorage.removeItem('currentBlogPost');
      
      // Redirect to dashboard or blog list
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to publish blog');
      console.error('Publish error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [title, content, tags, category, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">Please log in to write a blog post.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editor-bg">
      <div className="container mx-auto px-4 py-8">
        <BlogHeader
          title={title}
          onTitleChange={setTitle}
          tags={tags}
          onTagsChange={setTags}
          onSave={handleSave}
          onPreview={handlePreview}
          onPublish={handlePublish}
        />
        
        <div className="mt-8">
          <MarkdownEditor
            initialContent={content}
            onContentChange={setContent}
            placeholder="Start writing your blog post... Use markdown for formatting!"
          />
        </div>

        {/* Category Selection */}
        <div className="mt-6 max-w-4xl mx-auto">
          <label htmlFor="category" className="block text-sm font-medium text-editor-text mb-2">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-editor-border rounded-lg bg-editor-surface text-editor-text focus:outline-none focus:ring-2 focus:ring-editor-accent"
          >
            <option value="">Select a category</option>
            <option value="Technology">Technology</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="AI & Machine Learning">AI & Machine Learning</option>
            <option value="DevOps">DevOps</option>
            <option value="Mobile">Mobile</option>
            <option value="Web">Web</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Writing Stats */}
        <div className="mt-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between text-sm text-editor-text-muted">
            <div className="space-x-4">
              <span>{content.length} characters</span>
              <span>{content.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
              <span>{calculateReadTime(content)} min read</span>
            </div>
            <div>
              <span>
                Tip: Use Ctrl/Cmd + B for bold, Ctrl/Cmd + I for italic, Ctrl/Cmd + S to save
              </span>
            </div>
          </div>
        </div>
        
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={title}
          content={content}
          tags={tags}
        />
      </div>
    </div>
  );
}