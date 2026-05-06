import type { Metadata } from "next";

import { Footer } from "@/app/components/Footer";
import { Navigation } from "@/app/components/Navigation";
import { getBlogCategories, getBlogPosts } from "@/app/dashboard/actions/blogs";
import { BlogListClient } from "@/app/blog/BlogListClient";

export const metadata: Metadata = {
  title: "Blog | AIeasy",
  description: "Insights on AI automation, web design, and digital growth strategies.",
};

export const revalidate = 3600;

export default async function BlogPage() {
  const [postsResponse, categories] = await Promise.all([
    getBlogPosts({
      status: "published",
      page: 1,
      pageSize: 200,
      sort: "latest",
    }),
    getBlogCategories(),
  ]);

  return (
    <>
      <Navigation />
      <BlogListClient posts={postsResponse.posts} categories={categories} />
      <Footer />
    </>
  );
}
