import { useState, useCallback } from "react";
import { BlogHeader } from "@/components/BlogHeader";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { PreviewModal } from "@/components/PreviewModal";
import { toast } from "sonner";

const Editor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSave = useCallback(() => {
    // In a real app, this would save to a backend
    const blogPost = {
      title,
      content,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log("Saving blog post:", blogPost);
    localStorage.setItem('currentBlogPost', JSON.stringify(blogPost));
  }, [title, content, tags]);

  const handlePreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const handlePublish = useCallback(() => {
    if (!title.trim()) {
      toast.error("Please add a title before publishing");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Please add some content before publishing");
      return;
    }

    // In a real app, this would save to a backend
    const post = {
      title,
      content,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: true
    };

    localStorage.setItem('publishedBlogPost', JSON.stringify(post));
    toast.success("Blog post published successfully!");
    
    // Reset form
    setTitle("");
    setContent("");
    setTags([]);
  }, [title, content, tags]);

  return (
    <div className="min-h-screen bg-editor-bg">
      <div className="container mx-auto px-6 py-8">
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
};

export default Editor;