"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  tags: string[];
}

export const PreviewModal = ({
  isOpen,
  onClose,
  title,
  content,
  tags,
}: PreviewModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">Preview</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div
            className="overflow-y-auto p-6"
            style={{ maxHeight: "calc(90vh - 120px)" }}
          >
            <article className="max-w-none">
              {/* Title */}
              {title && (
                <h1 className="text-4xl font-bold mb-4 leading-tight">
                  {title}
                </h1>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ children, ...props }) {
                      return (
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                          <code className="font-mono text-sm" {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    blockquote({ children, ...props }) {
                      return (
                        <blockquote
                          className="border-l-4 border-primary pl-4 py-1 my-4 italic bg-muted/30"
                          {...props}
                        >
                          {children}
                        </blockquote>
                      );
                    },
                  }}
                >
                  {content || "Start writing your blog content..."}
                </ReactMarkdown>
              </div>
            </article>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

