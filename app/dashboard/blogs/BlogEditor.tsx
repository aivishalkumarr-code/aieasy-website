"use client";

import { LoaderCircle, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";

import {
  createBlogCategory,
  createBlogPost,
  createBlogTag,
  deleteBlogPost,
  updateBlogPost,
  uploadBlogImage,
} from "@/app/dashboard/actions/blogs";
import { TiptapEditor } from "@/components/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { BlogCategory, BlogPost, BlogPostStatus, BlogTag } from "@/types";

interface BlogEditorProps {
  post?: BlogPost | null;
  categories: BlogCategory[];
  tags: BlogTag[];
  onSave: () => void;
  onCancel: () => void;
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

interface FieldErrors {
  title?: string;
  slug?: string;
  content?: string;
}

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const toLocalDateTime = (value: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const htmlToText = (html: string) =>
  html
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const generateSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

export function BlogEditor({ post, categories, tags, onSave, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image ?? "");
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [status, setStatus] = useState<BlogPostStatus>(post?.status ?? "draft");
  const [scheduledAt, setScheduledAt] = useState(toLocalDateTime(post?.scheduled_at ?? null));
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonical_url ?? "");
  const [ogImage, setOgImage] = useState(post?.og_image ?? "");
  const [keywords, setKeywords] = useState(post?.keywords ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(post?.tags?.map((tag) => tag.id) ?? []);
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [availableTags, setAvailableTags] = useState(tags);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isCategorySlugEdited, setIsCategorySlugEdited] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [showSeo, setShowSeo] = useState(Boolean(post?.seo_title || post?.meta_description || post?.keywords));
  const [dragActive, setDragActive] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [autoSavedAt, setAutoSavedAt] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditMode = Boolean(post?.id);
  const storageKey = useMemo(() => (post?.id ? `blog-editor-draft:${post.id}` : null), [post?.id]);

  useEffect(() => {
    setTitle(post?.title ?? "");
    setSlug(post?.slug ?? "");
    setExcerpt(post?.excerpt ?? "");
    setContent(post?.content ?? "");
    setFeaturedImage(post?.featured_image ?? "");
    setCategoryId(post?.category_id ?? "");
    setStatus(post?.status ?? "draft");
    setScheduledAt(toLocalDateTime(post?.scheduled_at ?? null));
    setSeoTitle(post?.seo_title ?? "");
    setMetaDescription(post?.meta_description ?? "");
    setCanonicalUrl(post?.canonical_url ?? "");
    setOgImage(post?.og_image ?? "");
    setKeywords(post?.keywords ?? "");
    setSelectedTagIds(post?.tags?.map((tag) => tag.id) ?? []);
    setAvailableCategories(categories);
    setAvailableTags(tags);
    setShowCategoryForm(false);
    setNewCategoryName("");
    setNewCategorySlug("");
    setNewCategoryDescription("");
    setIsCategorySlugEdited(false);
    setTagQuery("");
    setShowSeo(Boolean(post?.seo_title || post?.meta_description || post?.keywords));
    setErrors({});
    setFeedback(null);
    setAutoSavedAt(null);
  }, [post, categories, tags]);

  const contentText = useMemo(() => htmlToText(content), [content]);
  const readingTime = useMemo(() => {
    const words = contentText ? contentText.split(/\s+/).length : 0;
    return words ? Math.max(1, Math.ceil(words / 200)) : 0;
  }, [contentText]);

  const selectedTags = useMemo(
    () => selectedTagIds.map((id) => availableTags.find((tag) => tag.id === id)).filter(Boolean) as BlogTag[],
    [availableTags, selectedTagIds],
  );

  const filteredTags = useMemo(() => {
    const query = tagQuery.trim().toLowerCase();
    return availableTags.filter((tag) => {
      const matchesQuery = !query || tag.name.toLowerCase().includes(query);
      return matchesQuery && !selectedTagIds.includes(tag.id);
    });
  }, [availableTags, selectedTagIds, tagQuery]);

  useEffect(() => {
    if (!isEditMode || !storageKey) {
      return;
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }

    try {
      const draft = JSON.parse(raw) as {
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        featuredImage: string;
        categoryId: string;
        status: BlogPostStatus;
        scheduledAt: string;
        seoTitle: string;
        metaDescription: string;
        canonicalUrl: string;
        ogImage: string;
        keywords: string;
        selectedTagIds: string[];
      };

      const shouldRestore = window.confirm("Unsaved draft found for this post. Restore it?");
      if (!shouldRestore) {
        return;
      }

      setTitle(draft.title);
      setSlug(draft.slug);
      setExcerpt(draft.excerpt);
      setContent(draft.content);
      setFeaturedImage(draft.featuredImage);
      setCategoryId(draft.categoryId);
      setStatus(draft.status);
      setScheduledAt(draft.scheduledAt);
      setSeoTitle(draft.seoTitle);
      setMetaDescription(draft.metaDescription);
      setCanonicalUrl(draft.canonicalUrl);
      setOgImage(draft.ogImage);
      setKeywords(draft.keywords);
      setSelectedTagIds(draft.selectedTagIds);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [isEditMode, storageKey]);

  useEffect(() => {
    if (!isEditMode || !storageKey) {
      return;
    }

    const interval = window.setInterval(() => {
      const payload = {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        categoryId,
        status,
        scheduledAt,
        seoTitle,
        metaDescription,
        canonicalUrl,
        ogImage,
        keywords,
        selectedTagIds,
      };

      window.localStorage.setItem(storageKey, JSON.stringify(payload));
      setAutoSavedAt(new Date());
    }, 30000);

    return () => window.clearInterval(interval);
  }, [
    isEditMode,
    storageKey,
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    categoryId,
    status,
    scheduledAt,
    seoTitle,
    metaDescription,
    canonicalUrl,
    ogImage,
    keywords,
    selectedTagIds,
  ]);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (title.trim().length < 3) {
      nextErrors.title = "Title must be at least 3 characters.";
    }

    if (!slug.trim()) {
      nextErrors.slug = "Slug is required.";
    } else if (!slugRegex.test(slug.trim())) {
      nextErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";
    }

    if (contentText.length < 50) {
      nextErrors.content = "Content must be at least 50 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const uploadFeaturedImage = async (file: File) => {
    setIsUploadingImage(true);
    const result = await uploadBlogImage(file);
    setIsUploadingImage(false);

    if (!result.success || !result.data) {
      setFeedback({ type: "error", message: result.message ?? "Unable to upload image." });
      return;
    }

    setFeaturedImage(result.data);
    setFeedback({ type: "success", message: result.message ?? "Image uploaded." });
  };

  const handleTagEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    const value = tagQuery.trim();
    if (!value) {
      return;
    }

    const existing = availableTags.find((tag) => tag.name.toLowerCase() === value.toLowerCase());

    if (existing) {
      setSelectedTagIds((current) => (current.includes(existing.id) ? current : [...current, existing.id]));
      setTagQuery("");
      return;
    }

    startTransition(async () => {
      const payload = new FormData();
      payload.append("name", value);
      const result = await createBlogTag(payload);

      if (!result.success || !result.data) {
        setFeedback({ type: "error", message: result.message ?? "Unable to create tag." });
        return;
      }

      setAvailableTags((current) => [...current, result.data as BlogTag]);
      setSelectedTagIds((current) => [...current, result.data!.id]);
      setTagQuery("");
      setFeedback({ type: "success", message: result.message ?? "Tag created." });
    });
  };

  const handleCreateCategory = () => {
    const trimmedName = newCategoryName.trim();
    const trimmedSlug = newCategorySlug.trim();

    if (!trimmedName) {
      setFeedback({ type: "error", message: "Category name is required." });
      return;
    }

    startTransition(async () => {
      const payload = new FormData();
      payload.append("name", trimmedName);
      payload.append("slug", trimmedSlug);
      payload.append("description", newCategoryDescription.trim());

      const result = await createBlogCategory(payload);

      if (!result.success || !result.data) {
        setFeedback({ type: "error", message: result.message ?? "Unable to create category." });
        return;
      }

      setAvailableCategories((current) => [...current, result.data as BlogCategory]);
      setCategoryId(result.data.id);
      setShowCategoryForm(false);
      setNewCategoryName("");
      setNewCategorySlug("");
      setNewCategoryDescription("");
      setIsCategorySlugEdited(false);
      setFeedback({ type: "success", message: result.message ?? "Category created." });
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!validate()) {
      return;
    }

    startTransition(async () => {
      const payload = new FormData();

      if (post?.id) {
        payload.append("id", post.id);
      }

      payload.append("title", title.trim());
      payload.append("slug", slug.trim());
      payload.append("excerpt", excerpt.trim());
      payload.append("content", content);
      payload.append("featured_image", featuredImage.trim());
      payload.append("category_id", categoryId);
      payload.append("status", status);
      payload.append("scheduled_at", status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : "");
      payload.append("seo_title", seoTitle.trim());
      payload.append("meta_description", metaDescription.trim());
      payload.append("canonical_url", canonicalUrl.trim());
      payload.append("og_image", ogImage.trim());
      payload.append("keywords", keywords.trim());
      payload.append("tag_ids", JSON.stringify(selectedTagIds));

      const result = post ? await updateBlogPost(payload) : await createBlogPost(payload);

      if (!result.success) {
        setFeedback({ type: "error", message: result.message ?? "Unable to save blog post." });
        return;
      }

      if (storageKey) {
        window.localStorage.removeItem(storageKey);
      }

      setFeedback({ type: "success", message: result.message ?? "Blog post saved." });
      onSave();
    });
  };

  const handleDelete = () => {
    if (!post?.id) {
      return;
    }

    const confirmed = window.confirm(`Delete ${post.title}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBlogPost(post.id);

      if (!result.success) {
        setFeedback({ type: "error", message: result.message ?? "Unable to delete blog post." });
        return;
      }

      if (storageKey) {
        window.localStorage.removeItem(storageKey);
      }

      setFeedback({ type: "success", message: result.message ?? "Blog post deleted." });
      onSave();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#1A1A1A]">Title</span>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Write blog title"
              className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
            {errors.title ? <p className="text-sm text-red-600">{errors.title}</p> : null}
          </label>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[#1A1A1A]">Slug</span>
              <Input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="auto-generated-if-empty"
                className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />
              {errors.slug ? <p className="text-sm text-red-600">{errors.slug}</p> : null}
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSlug(generateSlug(title))}
              className="h-11 rounded-xl border-[#DDE7E3] bg-white"
            >
              Generate from title
            </Button>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#1A1A1A]">Excerpt</span>
            <Textarea
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="2-3 sentence summary used as fallback meta description"
              className="min-h-24 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-[#1A1A1A]">Content</span>
            <TiptapEditor content={content} onChange={setContent} placeholder="Start writing your blog post..." />
            {errors.content ? <p className="text-sm text-red-600">{errors.content}</p> : null}
          </div>

          <div className="space-y-3">
            <span className="text-sm font-semibold text-[#1A1A1A]">Featured Image</span>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                const file = event.dataTransfer.files[0];
                if (file) {
                  void uploadFeaturedImage(file);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[1.4rem] border border-dashed bg-[#FAFAF8] p-5 text-center transition",
                dragActive ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#CBD5E1] hover:border-[#2563EB] hover:bg-[#EFF6FF]",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadFeaturedImage(file);
                  }
                }}
              />

              {featuredImage ? (
                <div className="w-full">
                  <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
                    <img src={featuredImage} alt="Featured preview" className="aspect-[16/10] w-full object-cover" />
                  </div>
                  <p className="mt-3 text-sm text-[#6B7280]">Click or drop a new image to replace.</p>
                </div>
              ) : (
                <div className="max-w-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#1A1A1A]">Drag and drop featured image</p>
                  <p className="mt-1 text-sm text-[#6B7280]">PNG, JPG, WebP, or GIF up to 5MB.</p>
                </div>
              )}
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#1A1A1A]">Image URL fallback</span>
              <Input
                value={featuredImage}
                onChange={(event) => setFeaturedImage(event.target.value)}
                className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
                placeholder="https://..."
              />
            </label>
          </div>
        </div>

        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#1A1A1A]">Category</span>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
              >
                <option value="">Uncategorized</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCategoryForm((current) => !current)}
                className="h-11 rounded-xl border-[#DDE7E3] bg-white"
              >
                New Category
              </Button>
            </div>

            {showCategoryForm ? (
              <div className="space-y-3 rounded-[1.5rem] border border-[#DDE7E3] bg-[#FAFAF8] p-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#1A1A1A]">Name</span>
                  <Input
                    value={newCategoryName}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewCategoryName(value);
                      if (!isCategorySlugEdited) {
                        setNewCategorySlug(generateSlug(value));
                      }
                    }}
                    className="h-10 rounded-xl border-[#DDE7E3] bg-white"
                    placeholder="Category name"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#1A1A1A]">Slug</span>
                  <Input
                    value={newCategorySlug}
                    onChange={(event) => {
                      setIsCategorySlugEdited(true);
                      setNewCategorySlug(generateSlug(event.target.value));
                    }}
                    className="h-10 rounded-xl border-[#DDE7E3] bg-white"
                    placeholder="category-slug"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#1A1A1A]">Description</span>
                  <Textarea
                    value={newCategoryDescription}
                    onChange={(event) => setNewCategoryDescription(event.target.value)}
                    className="min-h-20 rounded-xl border-[#DDE7E3] bg-white"
                    placeholder="Optional description"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={isPending}
                    className="h-10 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                  >
                    Create
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setNewCategoryName("");
                      setNewCategorySlug("");
                      setNewCategoryDescription("");
                      setIsCategorySlugEdited(false);
                    }}
                    className="h-10 rounded-xl border-[#DDE7E3] bg-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </label>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-[#1A1A1A]">Tags</span>
            <div className="rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] p-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedTags.length ? (
                  selectedTags.map((tag) => (
                    <span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => setSelectedTagIds((current) => current.filter((id) => id !== tag.id))}
                        className="rounded-full p-0.5 hover:bg-[#DBEAFE]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-[#6B7280]">No tags selected yet.</p>
                )}
              </div>
              <Input
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
                onKeyDown={handleTagEnter}
                placeholder="Search tags or press Enter to create"
                className="h-10 rounded-xl border-[#DDE7E3] bg-white"
              />
              {filteredTags.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filteredTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedTagIds((current) => [...current, tag.id])}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#4B5563] hover:bg-[#EFF6FF]"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-[#1A1A1A]">Status</span>
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] p-1.5">
              {([
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "scheduled", label: "Scheduled" },
              ] as const).map((option) => {
                const active = status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={cn(
                      "h-10 rounded-lg text-sm font-semibold transition",
                      active ? "bg-[#2563EB] text-white" : "text-[#4B5563] hover:bg-[#EFF6FF]",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {status === "scheduled" ? (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[#1A1A1A]">Schedule datetime</span>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
              />
            </label>
          ) : null}

          <div className="rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] p-4">
            <button
              type="button"
              onClick={() => setShowSeo((current) => !current)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-sm font-semibold text-[#1A1A1A]">SEO</span>
              <span className="text-xs font-medium text-[#2563EB]">{showSeo ? "Hide" : "Show"}</span>
            </button>

            {showSeo ? (
              <div className="mt-4 space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#1A1A1A]">SEO Title</span>
                  <Input
                    value={seoTitle}
                    onChange={(event) => setSeoTitle(event.target.value)}
                    className="h-10 rounded-xl border-[#DDE7E3] bg-white"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#1A1A1A]">Meta Description</span>
                  <Textarea
                    value={metaDescription}
                    onChange={(event) => setMetaDescription(event.target.value)}
                    className="min-h-20 rounded-xl border-[#DDE7E3] bg-white"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#1A1A1A]">Canonical URL</span>
                  <Input
                    value={canonicalUrl}
                    onChange={(event) => setCanonicalUrl(event.target.value)}
                    className="h-10 rounded-xl border-[#DDE7E3] bg-white"
                    placeholder="https://example.com/blog/post"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#1A1A1A]">OG Image URL</span>
                  <Input
                    value={ogImage}
                    onChange={(event) => setOgImage(event.target.value)}
                    className="h-10 rounded-xl border-[#DDE7E3] bg-white"
                    placeholder="https://..."
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-[#1A1A1A]">Keywords</span>
                  <Input
                    value={keywords}
                    onChange={(event) => setKeywords(event.target.value)}
                    className="h-10 rounded-xl border-[#DDE7E3] bg-white"
                    placeholder="ai, automation, content"
                  />
                </label>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] p-4">
            <p className="text-sm font-semibold text-[#1A1A1A]">Reading Time</p>
            <p className="mt-1 text-sm text-[#6B7280]">{readingTime} min read</p>
          </div>

          {autoSavedAt ? <p className="text-xs text-[#6B7280]">Auto-saved at {formatTime(autoSavedAt)}</p> : null}
          {isUploadingImage ? <p className="text-xs text-[#6B7280]">Uploading image...</p> : null}
        </div>
      </div>

      {feedback ? (
        <div
          className={cn(
            "mt-5 rounded-xl border p-4 text-sm",
            feedback.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#2563EB]/20 bg-[#EFF6FF] text-[#1D4ED8]",
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl border-[#DDE7E3] bg-white">
            Cancel
          </Button>
          {post ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-xl border-red-200 bg-white text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {post ? "Save changes" : "Create blog post"}
        </Button>
      </div>
    </form>
  );
}
