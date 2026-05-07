"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Facebook, Link2, Linkedin, Twitter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { BlogCard } from "@/app/components/BlogCard";
import { BlogContentRenderer } from "@/components/BlogContentRenderer";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/types";

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

const fallbackImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810" viewBox="0 0 1440 810" fill="none">
    <rect width="1440" height="810" rx="40" fill="#F8FAFC"/>
    <rect x="60" y="60" width="1320" height="690" rx="30" fill="white" stroke="#E5E7EB"/>
    <rect x="120" y="120" width="420" height="250" rx="22" fill="#2563EB" fill-opacity="0.12"/>
    <rect x="580" y="142" width="640" height="26" rx="13" fill="#E5E7EB"/>
    <rect x="580" y="192" width="520" height="18" rx="9" fill="#E5E7EB"/>
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

export function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const [pageUrl, setPageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const shareUrl = pageUrl || `/blog/${post.slug}`;
  const shareText = encodeURIComponent(post.title);
  const encodedUrl = encodeURIComponent(shareUrl);
  const readingTime = useMemo(() => estimateReadingTime(post), [post]);

  return (
    <main className="pb-24 pt-28">
      <section className="container">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-[#2563EB] transition hover:text-[#1D4ED8]">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <article className="mt-6 overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-white shadow-card">
          <div className="relative aspect-[16/9] w-full overflow-hidden lg:aspect-[21/9]">
            <Image
              src={post.featured_image ?? fallbackImage}
              alt={post.title}
              fill
              loading="lazy"
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="p-6 sm:p-8 lg:p-10">
            <span className="inline-flex rounded-full bg-[#2563EB]/10 px-3 py-1 text-xs font-medium text-[#2563EB]">
              {post.category?.name ?? "Uncategorized"}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#1A1A1A] sm:text-4xl">{post.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#6B7280]">
              <span>{formatDate(post.published_at ?? post.created_at)}</span>
              <span>•</span>
              <span>{readingTime} min read</span>
              <span>•</span>
              <span>AIeasy Studio</span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DDE7E3] px-3 text-xs font-medium text-[#4B5563] transition hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                <Twitter className="h-3.5 w-3.5" />
                X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DDE7E3] px-3 text-xs font-medium text-[#4B5563] transition hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DDE7E3] px-3 text-xs font-medium text-[#4B5563] transition hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                <Facebook className="h-3.5 w-3.5" />
                Facebook
              </a>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  if (!pageUrl) {
                    return;
                  }

                  await navigator.clipboard.writeText(pageUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
                className="h-9 rounded-lg border-[#DDE7E3] px-3 text-xs text-[#4B5563] hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy link"}
              </Button>
            </div>

            <BlogContentRenderer content={post.content} className="mt-10" />
          </div>
        </article>
      </section>

      {relatedPosts.length ? (
        <section className="container mt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#2563EB]">Related posts</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1A1A]">Continue reading</h2>
            </div>
            <Link href="/blog" className="text-sm font-medium text-[#2563EB] transition hover:text-[#1D4ED8]">
              View all
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <BlogCard
                key={relatedPost.id}
                title={relatedPost.title}
                excerpt={relatedPost.excerpt ?? "Read the full article for implementation details and practical examples."}
                coverImage={relatedPost.featured_image ?? fallbackImage}
                publishedAt={relatedPost.published_at ?? relatedPost.created_at}
                author="AIeasy Studio"
                slug={relatedPost.slug}
                category={relatedPost.category?.name ?? "Uncategorized"}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
