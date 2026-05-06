"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BlogCategory, BlogPost } from "@/types";

interface BlogListClientProps {
  posts: BlogPost[];
  categories: BlogCategory[];
}

const PAGE_SIZE = 9;
const fallbackImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" fill="none">
    <rect width="1200" height="675" rx="36" fill="#F8FAFC"/>
    <rect x="52" y="52" width="1096" height="571" rx="28" fill="white" stroke="#E5E7EB"/>
    <rect x="100" y="100" width="380" height="220" rx="20" fill="#2563EB" fill-opacity="0.12"/>
    <rect x="520" y="116" width="460" height="22" rx="11" fill="#E5E7EB"/>
    <rect x="520" y="160" width="380" height="16" rx="8" fill="#E5E7EB"/>
    <rect x="100" y="368" width="1000" height="1" fill="#E5E7EB"/>
    <rect x="100" y="420" width="220" height="58" rx="20" fill="#2563EB" fill-opacity="0.12"/>
  </svg>
`)}`;

const formatDate = (value: string | null) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value ?? Date.now()));

const estimateReadingTime = (post: BlogPost) => {
  if (post.reading_time && post.reading_time > 0) {
    return post.reading_time;
  }

  const words = post.content
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
};

export function BlogListClient({ posts, categories }: BlogListClientProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const categoryOptions = useMemo(() => {
    const usedCategoryIds = new Set(posts.map((post) => post.category_id).filter(Boolean));
    const activeCategories = categories.filter((category) => usedCategoryIds.has(category.id));

    return [{ id: "all", name: "All" }, ...activeCategories];
  }, [categories, posts]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const categoryMatch = selectedCategory === "all" ? true : post.category_id === selectedCategory;
      const queryMatch =
        !normalizedQuery ||
        `${post.title} ${post.excerpt ?? ""} ${post.content} ${post.category?.name ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);

      return categoryMatch && queryMatch;
    });
  }, [posts, query, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  const visiblePosts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPosts.slice(start, start + PAGE_SIZE);
  }, [filteredPosts, page]);

  const pageNumbers = useMemo(() => {
    const values: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let value = start; value <= end; value += 1) {
      values.push(value);
    }

    return values;
  }, [page, totalPages]);

  return (
    <main className="pb-24 pt-28">
      <section className="container">
          <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-8 shadow-card">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#2563EB]">Blog</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#1A1A1A] sm:text-5xl">AIeasy Blog</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#6B7280]">
              Insights on AI, automation, web design, and digital growth to help service businesses ship better systems.
            </p>

            <div className="mt-8">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search blog posts"
                  className="h-11 rounded-xl border-[#DDE7E3] bg-[#FAFAF8] pl-10"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {categoryOptions.map((category) => {
                const active = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      active
                        ? "bg-[#2563EB] text-white"
                        : "bg-[#F4F6F2] text-[#4B5563] hover:bg-[#DBEAFE] hover:text-[#2563EB]",
                    )}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
      </section>

      <section className="container mt-8">
          {visiblePosts.length ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {visiblePosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
                    <article className="h-full overflow-hidden rounded-[1.5rem] border border-[#E5E7EB] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={post.featured_image ?? fallbackImage}
                          alt={post.title}
                          fill
                          loading="lazy"
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-4 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex rounded-full bg-[#2563EB]/10 px-3 py-1 text-xs font-medium text-[#2563EB]">
                            {post.category?.name ?? "Uncategorized"}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-lg font-semibold leading-snug text-[#1A1A1A] transition-colors group-hover:text-[#2563EB]">
                            {post.title}
                          </h2>
                          <p className="line-clamp-3 text-sm leading-6 text-[#6B7280]">
                            {post.excerpt ?? "Read the full article for implementation details and practical examples."}
                          </p>
                        </div>
                        <p className="text-xs text-[#6B7280]">
                          AIeasy Studio • {formatDate(post.published_at ?? post.created_at)} • {estimateReadingTime(post)} min read
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {filteredPosts.length > PAGE_SIZE ? (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#6B7280]">
                    Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredPosts.length)} of{" "}
                    {filteredPosts.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setCurrentPage(page - 1)}
                      className="h-10 rounded-xl border-[#DDE7E3] bg-white"
                    >
                      Previous
                    </Button>
                    {pageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={cn(
                          "h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition",
                          page === pageNumber
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
                      disabled={page >= totalPages}
                      onClick={() => setCurrentPage(page + 1)}
                      className="h-10 rounded-xl border-[#DDE7E3] bg-white"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#DDE7E3] bg-white p-12 text-center">
              <h2 className="text-xl font-semibold text-[#1A1A1A]">No blog posts found</h2>
              <p className="mt-2 text-sm text-[#6B7280]">Try updating the search or selecting a different category.</p>
            </div>
          )}
      </section>
    </main>
  );
}
