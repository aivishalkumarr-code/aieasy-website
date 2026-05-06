import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Footer } from "@/app/components/Footer";
import { Navigation } from "@/app/components/Navigation";
import { BlogPostClient } from "@/app/blog/[slug]/BlogPostClient";
import { getBlogPostBySlug, getBlogPosts } from "@/app/dashboard/actions/blogs";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const getFallbackDescription = (content: string) =>
  content
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

export const revalidate = 3600;

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || post.status !== "published") {
    return {};
  }

  const title = post.seo_title || post.title;
  const description = post.meta_description || post.excerpt || getFallbackDescription(post.content);
  const image = post.og_image || post.featured_image || undefined;

  return {
    title,
    description,
    alternates: {
      canonical: post.canonical_url || `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: post.canonical_url || `/blog/${post.slug}`,
      images: image ? [{ url: image, alt: post.title }] : undefined,
      publishedTime: post.published_at ?? post.created_at,
      authors: ["AIeasy Studio"],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  const categoryRelated = post.category_id
    ? await getBlogPosts({
        status: "published",
        category_id: post.category_id,
        page: 1,
        pageSize: 8,
        sort: "latest",
      })
    : { posts: [] };

  let relatedPosts = categoryRelated.posts.filter((entry) => entry.id !== post.id).slice(0, 3);

  if (relatedPosts.length < 3) {
    const latestPosts = await getBlogPosts({
      status: "published",
      page: 1,
      pageSize: 12,
      sort: "latest",
    });

    const usedIds = new Set([post.id, ...relatedPosts.map((entry) => entry.id)]);
    for (const entry of latestPosts.posts) {
      if (usedIds.has(entry.id)) {
        continue;
      }
      relatedPosts.push(entry);
      usedIds.add(entry.id);
      if (relatedPosts.length === 3) {
        break;
      }
    }
  }

  return (
    <>
      <Navigation />
      <BlogPostClient post={post} relatedPosts={relatedPosts} />
      <Footer />
    </>
  );
}
