'use client';

import React, { useState } from 'react';
import { Save, Eye, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface BlogHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
}

export const BlogHeader = ({
  title,
  onTitleChange,
  tags,
  onTagsChange,
  onSave,
  onPreview,
  onPublish
}: BlogHeaderProps) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-editor-text">Write Your Blog</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="outline" onClick={onPreview} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button onClick={onPublish} className="gap-2">
            <Send className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <Separator />

      {/* Blog Title */}
      <div className="space-y-2">
        <label htmlFor="blog-title" className="text-sm font-medium text-editor-text">
          Title
        </label>
        <Input
          id="blog-title"
          type="text"
          placeholder="Enter your blog title..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 bg-transparent"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label htmlFor="blog-tags" className="text-sm font-medium text-editor-text">
          Tags
        </label>
        <div className="space-y-2">
          <Input
            id="blog-tags"
            type="text"
            placeholder="Add tags (press Enter to add)..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="text-sm"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTag(tag)}
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};