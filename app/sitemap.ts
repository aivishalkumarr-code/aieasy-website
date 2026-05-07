import { MetadataRoute } from "next";

import { getBlogPosts } from "@/app/dashboard/actions/blogs";
import { SERVICE_PAGE_LIST } from "@/app/services/service-data";

const siteUrl = "https://aieasy.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: new Date(), priority: 1.0 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${siteUrl}/lp/website-design`, lastModified: new Date(), priority: 0.9 },
  ];

  const servicePages: MetadataRoute.Sitemap = SERVICE_PAGE_LIST.map(
    (service) => ({
      url: `${siteUrl}/services/${service.slug}`,
      lastModified: new Date(),
      priority: 0.9,
    }),
  );

  const postsResponse = await getBlogPosts({
    status: "published",
    page: 1,
    pageSize: 200,
    sort: "latest",
  });

  const blogPages: MetadataRoute.Sitemap = postsResponse.posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at || post.created_at || new Date(),
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...blogPages];
}
