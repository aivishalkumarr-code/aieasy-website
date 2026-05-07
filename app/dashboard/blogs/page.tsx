import { getBlogCategories, getBlogPosts, getBlogTags } from "@/app/dashboard/actions/blogs";
import { BlogsClient } from "@/app/dashboard/blogs/BlogsClient";

export default async function BlogsPage() {
  const [postsResponse, categories, tags] = await Promise.all([
    getBlogPosts(),
    getBlogCategories(),
    getBlogTags(),
  ]);

  return (
    <BlogsClient
      initialPostsResponse={postsResponse}
      categories={categories}
      tags={tags}
    />
  );
}
