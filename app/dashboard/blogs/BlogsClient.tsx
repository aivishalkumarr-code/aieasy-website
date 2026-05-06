"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";

import {
  createBlogPost,
  deleteBlogPost,
  getBlogPosts,
  updateBlogPost,
  type BlogPostsResponse,
} from "@/app/dashboard/actions/blogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BlogCategory, BlogPost, BlogPostStatus, BlogTag } from "@/types";

interface BlogsClientProps {
  initialPostsResponse: BlogPostsResponse;
  categories: BlogCategory[];
  tags: BlogTag[];
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

interface BlogEditorProps {
  categories: BlogCategory[];
  tags: BlogTag[];
  editingPost: BlogPost | null;
  isPending: boolean;
  onCancel: () => void;
  onSave: (formData: FormData) => void;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const statusBadgeStyles: Record<BlogPostStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
};

const statusOptions: Array<{ label: string; value: BlogPostStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Scheduled", value: "scheduled" },
];

function BlogEditor({
  categories,
  tags,
  editingPost,
  isPending,
  onCancel,
  onSave,
}: BlogEditorProps) {
  const [title, setTitle] = useState(editingPost?.title ?? "");
  const [slug, setSlug] = useState(editingPost?.slug ?? "");
  const [status, setStatus] = useState<BlogPostStatus>(editingPost?.status ?? "draft");
  const [categoryId, setCategoryId] = useState(editingPost?.category_id ?? "");
  const [excerpt, setExcerpt] = useState(editingPost?.excerpt ?? "");
  const [content, setContent] = useState(editingPost?.content ?? "");
  const [featuredImage, setFeaturedImage] = useState(editingPost?.featured_image ?? "");
  const [keywords, setKeywords] = useState(editingPost?.keywords ?? "");
  const [seoTitle, setSeoTitle] = useState(editingPost?.seo_title ?? "");
  const [metaDescription, setMetaDescription] = useState(editingPost?.meta_description ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(editingPost?.canonical_url ?? "");
  const [ogImage, setOgImage] = useState(editingPost?.og_image ?? "");
  const [scheduledAt, setScheduledAt] = useState(editingPost?.scheduled_at ? editingPost.scheduled_at.slice(0, 16) : "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(editingPost?.tags?.map((tag) => tag.id) ?? []);

  useEffect(() => {
    setTitle(editingPost?.title ?? "");
    setSlug(editingPost?.slug ?? "");
    setStatus(editingPost?.status ?? "draft");
    setCategoryId(editingPost?.category_id ?? "");
    setExcerpt(editingPost?.excerpt ?? "");
    setContent(editingPost?.content ?? "");
    setFeaturedImage(editingPost?.featured_image ?? "");
    setKeywords(editingPost?.keywords ?? "");
    setSeoTitle(editingPost?.seo_title ?? "");
    setMetaDescription(editingPost?.meta_description ?? "");
    setCanonicalUrl(editingPost?.canonical_url ?? "");
    setOgImage(editingPost?.og_image ?? "");
    setScheduledAt(editingPost?.scheduled_at ? editingPost.scheduled_at.slice(0, 16) : "");
    setSelectedTagIds(editingPost?.tags?.map((tag) => tag.id) ?? []);
  }, [editingPost]);

  const handleSubmit = () => {
    const payload = new FormData();

    if (editingPost) {
      payload.append("id", editingPost.id);
    }

    payload.append("title", title.trim());
    payload.append("slug", slug.trim());
    payload.append("status", status);
    payload.append("category_id", categoryId);
    payload.append("excerpt", excerpt.trim());
    payload.append("content", content.trim());
    payload.append("featured_image", featuredImage.trim());
    payload.append("keywords", keywords.trim());
    payload.append("seo_title", seoTitle.trim());
    payload.append("meta_description", metaDescription.trim());
    payload.append("canonical_url", canonicalUrl.trim());
    payload.append("og_image", ogImage.trim());
    payload.append("scheduled_at", scheduledAt ? new Date(scheduledAt).toISOString() : "");
    payload.append("tag_ids", JSON.stringify(selectedTagIds));

    onSave(payload);
  };

  return (
    <div className="mt-6 rounded-[1.5rem] border border-[#DDE7E3] bg-[#FAFAF8] p-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Title</span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write blog title"
            className="h-11 rounded-xl border-[#DDE7E3] bg-white"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Slug</span>
          <Input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="auto-generated-if-empty"
            className="h-11 rounded-xl border-[#DDE7E3] bg-white"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as BlogPostStatus)}
            className="h-11 w-full rounded-xl border border-[#DDE7E3] bg-white px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Category</span>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="h-11 w-full rounded-xl border border-[#DDE7E3] bg-white px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        {status === "scheduled" ? (
          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-semibold text-[#1A1A1A]">Schedule at</span>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              className="h-11 rounded-xl border-[#DDE7E3] bg-white"
            />
          </label>
        ) : null}

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Excerpt</span>
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            className="min-h-20 w-full rounded-xl border border-[#DDE7E3] bg-white p-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
            placeholder="Brief summary"
          />
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Content</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-56 w-full rounded-xl border border-[#DDE7E3] bg-white p-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
            placeholder="Write blog content"
          />
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Tags</span>
          <div className="flex flex-wrap gap-2 rounded-xl border border-[#DDE7E3] bg-white p-3">
            {tags.length ? (
              tags.map((tag) => {
                const active = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      setSelectedTagIds((current) =>
                        current.includes(tag.id)
                          ? current.filter((id) => id !== tag.id)
                          : [...current, tag.id],
                      )
                    }
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      active ? "bg-[#2563EB] text-white" : "bg-[#F4F6F2] text-[#4B5563]",
                    )}
                  >
                    {tag.name}
                  </button>
                );
              })
            ) : (
              <span className="text-sm text-[#6B7280]">No tags yet.</span>
            )}
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Featured image URL</span>
          <Input
            value={featuredImage}
            onChange={(event) => setFeaturedImage(event.target.value)}
            className="h-11 rounded-xl border-[#DDE7E3] bg-white"
            placeholder="https://..."
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Keywords</span>
          <Input
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            className="h-11 rounded-xl border-[#DDE7E3] bg-white"
            placeholder="ai, automation, seo"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">SEO title</span>
          <Input
            value={seoTitle}
            onChange={(event) => setSeoTitle(event.target.value)}
            className="h-11 rounded-xl border-[#DDE7E3] bg-white"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Meta description</span>
          <Input
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
            className="h-11 rounded-xl border-[#DDE7E3] bg-white"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">Canonical URL</span>
          <Input
            value={canonicalUrl}
            onChange={(event) => setCanonicalUrl(event.target.value)}
            className="h-11 rounded-xl border-[#DDE7E3] bg-white"
            placeholder="https://example.com/blog/post"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#1A1A1A]">OG image URL</span>
          <Input
            value={ogImage}
            onChange={(event) => setOgImage(event.target.value)}
            className="h-11 rounded-xl border-[#DDE7E3] bg-white"
            placeholder="https://..."
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl border-[#DDE7E3] bg-white">
          Cancel
        </Button>
        <Button
          type="button"
          disabled={isPending || !title.trim() || !content.trim()}
          onClick={handleSubmit}
          className="h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {editingPost ? "Save changes" : "Create blog post"}
        </Button>
      </div>
    </div>
  );
}

export function BlogsClient({
  initialPostsResponse,
  categories,
  tags,
}: BlogsClientProps) {
  const [postsResponse, setPostsResponse] = useState(initialPostsResponse);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<BlogPostStatus | "all">("all");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const loadPosts = useCallback((page: number) => {
    startTransition(async () => {
      const data = await getBlogPosts({
        page,
        status,
        category_id: categoryId === "all" ? undefined : categoryId,
        query: debouncedQuery,
        sort,
      });
      setPostsResponse(data);
    });
  }, [categoryId, debouncedQuery, sort, status]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, postsResponse.page - 2);
    const end = Math.min(postsResponse.totalPages, postsResponse.page + 2);

    for (let value = start; value <= end; value += 1) {
      pages.push(value);
    }

    return pages;
  }, [postsResponse.page, postsResponse.totalPages]);

  const handleCreate = () => {
    setEditingPost(null);
    setIsEditorOpen(true);
    setFeedback(null);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsEditorOpen(true);
    setFeedback(null);
  };

  const handleDelete = (post: BlogPost) => {
    if (!window.confirm(`Delete ${post.title}? This action cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBlogPost(post.id);

      if (!result.success) {
        setFeedback({ type: "error", message: result.message ?? "Unable to delete blog post." });
        return;
      }

      setFeedback({ type: "success", message: result.message ?? "Blog post deleted." });
      const targetPage = postsResponse.posts.length === 1 ? Math.max(1, postsResponse.page - 1) : postsResponse.page;
      const data = await getBlogPosts({
        page: targetPage,
        status,
        category_id: categoryId === "all" ? undefined : categoryId,
        query: debouncedQuery,
        sort,
      });
      setPostsResponse(data);
    });
  };

  const handleSave = (formData: FormData) => {
    startTransition(async () => {
      const result = editingPost
        ? await updateBlogPost(formData)
        : await createBlogPost(formData);

      if (!result.success) {
        setFeedback({ type: "error", message: result.message ?? "Unable to save blog post." });
        return;
      }

      setFeedback({ type: "success", message: result.message ?? "Blog post saved." });
      setIsEditorOpen(false);
      setEditingPost(null);
      const data = await getBlogPosts({
        page: postsResponse.page,
        status,
        category_id: categoryId === "all" ? undefined : categoryId,
        query: debouncedQuery,
        sort,
      });
      setPostsResponse(data);
    });
  };

  return (
    <section className="rounded-[2rem] border border-[#DDE7E3] bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Blog management</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Create, edit, and publish blog content with categories, tags, and SEO fields.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleCreate}
          className="h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
        >
          <Plus className="h-4 w-4" />
          Create Blog Post
        </Button>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-4">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search posts"
          className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8] lg:col-span-2"
        />
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="h-11 rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as "latest" | "oldest")}
          className="h-11 rounded-xl border border-[#DDE7E3] bg-[#FAFAF8] px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#2563EB]"
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {statusOptions.map((option) => {
          const active = status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-[#2563EB] text-white"
                  : "bg-[#F4F6F2] text-[#4B5563] hover:bg-[#DBEAFE] hover:text-[#2563EB]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {isEditorOpen ? (
        <BlogEditor
          categories={categories}
          tags={tags}
          editingPost={editingPost}
          isPending={isPending}
          onCancel={() => {
            setIsEditorOpen(false);
            setEditingPost(null);
          }}
          onSave={handleSave}
        />
      ) : null}

      {feedback ? (
        <div
          className={cn(
            "mt-4 rounded-xl border p-4 text-sm",
            feedback.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#2563EB]/20 bg-blue-50 text-[#1D4ED8]",
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      {postsResponse.posts.length ? (
        <>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Tags</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {postsResponse.posts.map((post) => (
                  <tr key={post.id} className="border-b border-[#F3F4F6] align-top">
                    <td className="py-4 pr-4">
                      <p className="font-medium text-[#1A1A1A]">{post.title}</p>
                      <p className="text-xs text-[#6B7280]">/{post.slug}</p>
                    </td>
                    <td className="py-4 pr-4 text-[#4B5563]">{post.category?.name ?? "Uncategorized"}</td>
                    <td className="py-4 pr-4">
                      <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusBadgeStyles[post.status])}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-[#4B5563]">
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags?.length ? (
                          post.tags.map((tag) => (
                            <span key={tag.id} className="rounded-full bg-[#F4F6F2] px-2.5 py-1 text-xs font-medium">
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#9CA3AF]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-[#4B5563]">{formatDate(post.created_at)}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleEdit(post)}
                          className="h-9 rounded-xl border-[#DDE7E3] bg-white"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDelete(post)}
                          className="h-9 rounded-xl border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#6B7280]">
              Showing {(postsResponse.page - 1) * postsResponse.pageSize + 1}-
              {Math.min(postsResponse.page * postsResponse.pageSize, postsResponse.total)} of {postsResponse.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending || postsResponse.page <= 1}
                onClick={() => loadPosts(postsResponse.page - 1)}
                className="h-10 rounded-xl border-[#DDE7E3] bg-white"
              >
                Previous
              </Button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  disabled={isPending}
                  onClick={() => loadPosts(pageNumber)}
                  className={cn(
                    "h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition",
                    postsResponse.page === pageNumber
                      ? "bg-[#2563EB] text-white"
                      : "border border-[#DDE7E3] bg-white text-[#4B5563] hover:text-[#2563EB]",
                  )}
                >
                  {pageNumber}
                </button>
              ))}
              <Button
                type="button"
                variant="outline"
                disabled={isPending || postsResponse.page >= postsResponse.totalPages}
                onClick={() => loadPosts(postsResponse.page + 1)}
                className="h-10 rounded-xl border-[#DDE7E3] bg-white"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#DDE7E3] bg-[#FAFAF8] p-10 text-center">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">No blog posts found</h3>
          <p className="mt-2 text-sm text-[#6B7280]">Adjust filters, update search, or create your first blog post.</p>
        </div>
      )}
    </section>
  );
}
