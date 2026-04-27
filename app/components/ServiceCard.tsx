import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export function ServiceCard({
  icon: Icon,
  title,
  description,
  href,
}: ServiceCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full rounded-[1.5rem] border border-[#E5E7EB] bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-card">
        <CardContent className="flex h-full flex-col gap-5 p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
            <Icon className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold tracking-tight text-[#1A1A1A]">
              {title}
            </h3>
            <p className="line-clamp-2 text-sm leading-6 text-[#6B7280]">
              {description}
            </p>
          </div>
          <div className="mt-auto flex items-center gap-2 text-sm font-medium text-[#2563EB] transition-colors group-hover:text-[#1D4ED8]">
            <span>Learn more</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
