import { useState, useRef, useCallback } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { toast } from "sonner";

interface MarkdownEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  placeholder?: string;
}

export const MarkdownEditor = ({ 
  initialContent = "", 
  onContentChange,
  placeholder = "Start writing your blog post..."
}: MarkdownEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    onContentChange?.(value);
  }, [onContentChange]);

  const insertText = useCallback((beforeText: string, afterText: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    // Use placeholder if no text is selected and placeholder is provided
    const textToWrap = selectedText || placeholder;
    
    const newText = content.substring(0, start) + 
                   beforeText + textToWrap + afterText + 
                   content.substring(end);
    
    handleContentChange(newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        // If text was selected, place cursor after the formatted text
        const newCursorPos = start + beforeText.length + textToWrap.length + afterText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      } else if (placeholder) {
        // If using placeholder, select the placeholder text for easy editing
        const selectionStart = start + beforeText.length;
        const selectionEnd = selectionStart + placeholder.length;
        textarea.setSelectionRange(selectionStart, selectionEnd);
      } else {
        // No selection and no placeholder, place cursor between the markers
        const newCursorPos = start + beforeText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [content, handleContentChange]);

  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Find the start of the current line
    const beforeCursor = content.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    
    // Get selected lines
    const afterCursor = content.substring(end);
    const nextNewline = afterCursor.indexOf('\n');
    const lineEnd = nextNewline === -1 ? content.length : end + nextNewline;
    
    const selectedLines = content.substring(lineStart, lineEnd);
    const lines = selectedLines.split('\n');
    
    // Add prefix to each line
    const newLines = lines.map(line => {
      // Don't add prefix to empty lines
      if (line.trim() === '') return line;
      return prefix + line;
    });
    
    const newText = content.substring(0, lineStart) + 
                   newLines.join('\n') + 
                   content.substring(lineEnd);
    
    handleContentChange(newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + (prefix.length * lines.filter(line => line.trim() !== '').length);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, handleContentChange]);

  const handleFormat = useCallback((format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    switch (format) {
      case 'bold':
        insertText('**', '**', 'bold text');
        break;
      case 'italic':
        insertText('*', '*', 'italic text');
        break;
      case 'code':
        insertText('`', '`', 'code');
        break;
      case 'h1':
        insertAtLineStart('# ');
        break;
      case 'h2':
        insertAtLineStart('## ');
        break;
      case 'h3':
        insertAtLineStart('### ');
        break;
      case 'ul':
        insertAtLineStart('- ');
        break;
      case 'ol':
        insertAtLineStart('1. ');
        break;
      case 'quote':
        insertAtLineStart('> ');
        break;
      case 'link':
        const linkText = selectedText || 'link text';
        insertText('[', '](https://example.com)', linkText);
        break;
      case 'image':
        const altText = selectedText || 'image description';
        insertText('![', '](https://example.com/image.jpg)', altText);
        break;
      default:
        break;
    }
  }, [insertText, insertAtLineStart]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          handleFormat('italic');
          break;
        case 's':
          e.preventDefault();
          toast.success("Content saved!");
          break;
      }
    }

    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ');
    }
  }, [handleFormat, insertText]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <EditorToolbar onFormat={handleFormat} activeFormats={activeFormats} />
      
      <div className="mt-4 border border-editor-border rounded-lg overflow-hidden bg-editor-surface">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-96 p-6 bg-transparent text-editor-text placeholder:text-editor-text-muted resize-none focus:outline-none font-mono text-sm leading-relaxed"
          style={{ 
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace'
          }}
        />
      </div>

      <div className="mt-4 text-sm text-editor-text-muted">
        <div className="flex items-center justify-between">
          <span>{content.length} characters</span>
          <span>
            Tip: Use Ctrl/Cmd + B for bold, Ctrl/Cmd + I for italic, Ctrl/Cmd + S to save
          </span>
        </div>
      </div>
    </div>
  );
};