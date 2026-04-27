import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  rating: number;
  quote: string;
  initials: string;
  imageUrl?: string;
}

export function TestimonialCard({
  name,
  role,
  company,
  rating,
  quote,
  initials,
  imageUrl,
}: TestimonialCardProps) {
  return (
    <Card className="h-full rounded-[1.5rem] border border-[#E5E7EB] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <CardContent className="flex h-full flex-col p-7">
        <div className="flex items-center gap-1 text-[#F59E0B]">
          {Array.from({ length: rating }).map((_, index) => (
            <Star key={`${name}-${index}`} className="h-4 w-4 fill-current" />
          ))}
        </div>
        <blockquote className="mt-5 text-lg italic leading-8 text-[#1A1A1A]">
          “{quote}”
        </blockquote>
        <div className="mt-auto flex items-center gap-4 pt-8">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB]/10 text-sm font-semibold text-[#2563EB]">
              {initials}
            </div>
          )}
          <div>
            <p className="font-semibold text-[#1A1A1A]">{name}</p>
            <p className="text-sm text-[#6B7280]">
              {role}, {company}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
