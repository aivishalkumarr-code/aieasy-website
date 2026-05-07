"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";

import { getBlogPosts, type BlogPostsResponse } from "@/app/dashboard/actions/blogs";
import { BlogEditor } from "@/app/dashboard/blogs/BlogEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BlogCategory, BlogPost, BlogPostStatus, BlogTag } from "@/types";

interface BlogsClientProps {
  initialPostsResponse: BlogPostsResponse;
  categories: BlogCategory[];
  tags: BlogTag[];
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

export function BlogsClient({ initialPostsResponse, categories, tags }: BlogsClientProps) {
  const [postsResponse, setPostsResponse] = useState(initialPostsResponse);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<BlogPostStatus | "all">("all");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [isPending, startTransition] = useTransition();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const loadPosts = useCallback(
    (page: number) => {
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
    },
    [categoryId, debouncedQuery, sort, status],
  );

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
          onClick={() => {
            setEditingPost(null);
            setIsEditorOpen(true);
          }}
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
          post={editingPost}
          categories={categories}
          tags={tags}
          onCancel={() => {
            setIsEditorOpen(false);
            setEditingPost(null);
          }}
          onSave={() => {
            setIsEditorOpen(false);
            setEditingPost(null);
            loadPosts(postsResponse.page);
          }}
        />
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
                          onClick={() => {
                            setEditingPost(post);
                            setIsEditorOpen(true);
                          }}
                          className="h-9 rounded-xl border-[#DDE7E3] bg-white"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
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
