'use client';

import React from 'react';
import { 
  Bold, 
  Italic, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  Image 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface EditorToolbarProps {
  onFormat: (format: string) => void;
  activeFormats: Set<string>;
}

export const EditorToolbar = ({ onFormat, activeFormats }: EditorToolbarProps) => {
  const toolbarItems = [
    { id: 'bold', icon: Bold, label: 'Bold (Ctrl+B)' },
    { id: 'italic', icon: Italic, label: 'Italic (Ctrl+I)' },
    { id: 'code', icon: Code, label: 'Inline Code' },
  ];

  const headingItems = [
    { id: 'h1', icon: Heading1, label: 'Heading 1' },
    { id: 'h2', icon: Heading2, label: 'Heading 2' },
    { id: 'h3', icon: Heading3, label: 'Heading 3' },
  ];

  const listItems = [
    { id: 'ul', icon: List, label: 'Unordered List' },
    { id: 'ol', icon: ListOrdered, label: 'Ordered List' },
    { id: 'quote', icon: Quote, label: 'Quote' },
  ];

  const mediaItems = [
    { id: 'link', icon: Link, label: 'Insert Link' },
    { id: 'image', icon: Image, label: 'Insert Image' },
  ];

  const renderToolbarGroup = (items: typeof toolbarItems) => (
    items.map((item) => {
      const Icon = item.icon;
      const isActive = activeFormats.has(item.id);
      
      return (
        <Button
          key={item.id}
          variant={isActive ? "default" : "ghost"}
          size="sm"
          onClick={() => onFormat(item.id)}
          title={item.label}
          className="h-8 w-8 p-0"
        >
          <Icon className="h-4 w-4" />
        </Button>
      );
    })
  );

  return (
    <div className="flex items-center gap-1 p-3 border border-editor-border rounded-t-lg bg-editor-surface">
      {/* Text formatting */}
      <div className="flex items-center gap-1">
        {renderToolbarGroup(toolbarItems)}
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Headings */}
      <div className="flex items-center gap-1">
        {renderToolbarGroup(headingItems)}
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Lists and quotes */}
      <div className="flex items-center gap-1">
        {renderToolbarGroup(listItems)}
      </div>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Media */}
      <div className="flex items-center gap-1">
        {renderToolbarGroup(mediaItems)}
      </div>
    </div>
  );
};