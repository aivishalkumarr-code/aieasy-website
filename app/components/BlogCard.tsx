import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface BlogCardProps {
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  author: string;
  slug: string;
  category: string;
}

export function BlogCard({
  title,
  excerpt,
  coverImage,
  publishedAt,
  author,
  slug,
  category,
}: BlogCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(publishedAt));

  return (
    <Link href={`/blog/${slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden rounded-[1.5rem] border border-[#E5E7EB] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <Badge
              variant="secondary"
              className="rounded-full bg-[#0D9488]/10 px-3 py-1 text-xs font-medium text-[#0D9488] hover:bg-[#0D9488]/10"
            >
              {category}
            </Badge>
            <span className="text-xs text-[#6B7280]">{formattedDate}</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold leading-snug text-[#1A1A1A] transition-colors group-hover:text-[#0D9488]">
              {title}
            </h3>
            <p className="line-clamp-2 text-sm leading-6 text-[#6B7280]">
              {excerpt}
            </p>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#6B7280]">
            {author}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
