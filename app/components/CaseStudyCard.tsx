import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface CaseStudyCardProps {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  results: readonly string[];
  slug: string;
}

export function CaseStudyCard({
  title,
  category,
  description,
  imageUrl,
  results,
  slug,
}: CaseStudyCardProps) {
  return (
    <Card className="overflow-hidden rounded-[1.75rem] border border-[#E5E7EB] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <CardContent className="space-y-4 p-6">
        <Badge className="rounded-full bg-[#0D9488]/10 px-3 py-1 text-xs font-medium text-[#0D9488] hover:bg-[#0D9488]/10">
          {category}
        </Badge>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-[#1A1A1A]">{title}</h3>
          <p className="text-sm leading-6 text-[#6B7280]">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {results.map((result) => (
            <span
              key={result}
              className="rounded-full border border-[#E5E7EB] bg-[#FAFAF8] px-3 py-1 text-xs font-medium text-[#1A1A1A]"
            >
              {result}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <Link
          href={`/case-studies/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0D9488] transition-colors hover:text-[#14B8A6]"
        >
          <span>View case study</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
