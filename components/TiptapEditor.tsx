"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import Dropcursor from "@tiptap/extension-dropcursor";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize,
  Minimize,
  Minus,
  Quote,
  Strikethrough,
  Table2,
  TableCellsMerge,
  Trash2,
  Video,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { uploadBlogImage } from "@/app/dashboard/actions/blogs";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

const YOUTUBE_URL_REGEX = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/i;

const getYoutubeEmbedUrl = (url: string) => {
  const match = url.match(YOUTUBE_URL_REGEX);
  if (!match?.[1]) {
    return null;
  }

  return `https://www.youtube.com/watch?v=${match[1]}`;
};

function ToolbarButton({ icon, label, onClick, active = false, disabled = false }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#1A1A1A] transition",
        active ? "bg-[#2563EB] text-white" : "hover:bg-[#EFF6FF]",
        disabled ? "cursor-not-allowed opacity-50" : "",
      )}
    >
      {icon}
    </button>
  );
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Start writing your blog post...",
}: TiptapEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Dropcursor,
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "ProseMirror min-h-[400px] rounded-b-xl bg-white p-4 text-[#1A1A1A] outline-none",
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) => file.type.startsWith("image/"));

        if (!files.length) {
          return false;
        }

        event.preventDefault();
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;

        files.forEach((file, index) => {
          void (async () => {
            setIsUploading(true);
            const result = await uploadBlogImage(file);

            if (result.success && result.data) {
              const chain = editor?.chain().focus();
              if (typeof position === "number" && index === 0) {
                chain?.setTextSelection(position);
              }
              chain?.setImage({ src: result.data }).run();
            }

            setIsUploading(false);
          })();
        });

        return true;
      },
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData("text/plain")?.trim() ?? "";
        const embedUrl = getYoutubeEmbedUrl(text);

        if (!embedUrl) {
          return false;
        }

        event.preventDefault();
        editor
          ?.chain()
          .focus()
          .setYoutubeVideo({
            src: embedUrl,
            width: 1280,
            height: 720,
          })
          .run();

        return true;
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.getHTML();
    if (content !== currentHtml) {
      editor.commands.setContent(content || "", { emitUpdate: false });
    }
  }, [content, editor]);

  const textContent = editor?.getText() ?? "";
  const characterCount = textContent.replace(/\s+/g, " ").trim().length;
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;

  const handleLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) {
      return;
    }

    if (!url.trim()) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const handleImageUrl = () => {
    const url = window.prompt("Enter image URL", "https://");

    if (!url?.trim()) {
      return;
    }

    editor?.chain().focus().setImage({ src: url.trim() }).run();
  };

  const handleYoutubeInsert = () => {
    const url = window.prompt("Paste YouTube URL", "https://www.youtube.com/watch?v=");
    const embedUrl = getYoutubeEmbedUrl(url ?? "");

    if (!embedUrl) {
      return;
    }

    editor
      ?.chain()
      .focus()
      .setYoutubeVideo({
        src: embedUrl,
        width: 1280,
        height: 720,
      })
      .run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[#DDE7E3]",
        isFullscreen ? "fixed inset-4 z-50 bg-[#FAFAF8] shadow-2xl" : "relative",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 rounded-t-xl border-b border-[#DDE7E3] bg-[#F8FAFC] p-2">
        <div className="flex items-center gap-1 rounded-lg bg-white/70 p-1">
          <ToolbarButton
            icon={<Heading1 className="h-4 w-4" />}
            label="Heading 1"
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          />
          <ToolbarButton
            icon={<Heading2 className="h-4 w-4" />}
            label="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          <ToolbarButton
            icon={<Heading3 className="h-4 w-4" />}
            label="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-white/70 p-1">
          <ToolbarButton
            icon={<Bold className="h-4 w-4" />}
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            icon={<Italic className="h-4 w-4" />}
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            icon={<Strikethrough className="h-4 w-4" />}
            label="Strikethrough"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-white/70 p-1">
          <ToolbarButton
            icon={<List className="h-4 w-4" />}
            label="Bullet List"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            icon={<ListOrdered className="h-4 w-4" />}
            label="Ordered List"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            icon={<Quote className="h-4 w-4" />}
            label="Blockquote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarButton
            icon={<Minus className="h-4 w-4" />}
            label="Code Block"
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-white/70 p-1">
          <ToolbarButton icon={<Link2 className="h-4 w-4" />} label="Link" onClick={handleLink} active={editor.isActive("link")} />
          <ToolbarButton icon={<ImagePlus className="h-4 w-4" />} label="Insert Image URL" onClick={handleImageUrl} />
          <ToolbarButton icon={<Video className="h-4 w-4" />} label="Embed YouTube" onClick={handleYoutubeInsert} />
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-white/70 p-1">
          <ToolbarButton
            icon={<Table2 className="h-4 w-4" />}
            label="Insert Table"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          />
          <ToolbarButton
            icon={<TableCellsMerge className="h-4 w-4" />}
            label="Add Column"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.isActive("table")}
          />
          <ToolbarButton
            icon={<TableCellsMerge className="h-4 w-4 rotate-90" />}
            label="Add Row"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.isActive("table")}
          />
          <ToolbarButton
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete Table"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.isActive("table")}
          />
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-lg bg-white/70 p-1">
          <ToolbarButton
            icon={isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            label="Toggle Fullscreen"
            onClick={() => setIsFullscreen((current) => !current)}
          />
        </div>
      </div>

      <div
        className={cn(
          "bg-white",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#9CA3AF]",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          "[&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-3xl [&_h1]:font-bold",
          "[&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:text-2xl [&_h2]:font-semibold",
          "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold",
          "[&_p]:mb-3 [&_p]:leading-7",
          "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6",
          "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#2563EB] [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_pre]:my-4 [&_pre]:rounded-lg [&_pre]:bg-[#1A1A1A] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-white",
          "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-[#E5E7EB]",
          "[&_td]:border [&_td]:border-[#E5E7EB] [&_td]:p-2",
          "[&_th]:border [&_th]:border-[#E5E7EB] [&_th]:bg-[#F8FAFC] [&_th]:p-2 [&_th]:text-left",
          "[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg",
          "[&_iframe]:my-4 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-lg",
        )}
      >
        <EditorContent editor={editor} />
      </div>

      {editor ? (
        <BubbleMenu editor={editor}>
          <div className="flex items-center gap-1 rounded-xl border border-[#DDE7E3] bg-white p-1 shadow-lg">
            <ToolbarButton
              icon={<Bold className="h-4 w-4" />}
              label="Bold"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
              icon={<Italic className="h-4 w-4" />}
              label="Italic"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
              icon={<Strikethrough className="h-4 w-4" />}
              label="Strike"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <ToolbarButton icon={<Link2 className="h-4 w-4" />} label="Link" active={editor.isActive("link")} onClick={handleLink} />
          </div>
        </BubbleMenu>
      ) : null}

      <div className="flex items-center justify-between border-t border-[#DDE7E3] bg-[#F8FAFC] px-4 py-2 text-xs text-[#6B7280]">
        <span>{wordCount} words</span>
        <span>{characterCount} characters</span>
        <span>{isUploading ? "Uploading image..." : "Ready"}</span>
      </div>
    </div>
  );
}
