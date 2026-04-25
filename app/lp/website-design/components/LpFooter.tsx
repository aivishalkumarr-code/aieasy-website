import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { sectionContainerClass } from "./LandingPrimitives";

export function LpFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className={`${sectionContainerClass} py-10 sm:py-12`}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-lg font-semibold tracking-tight text-slate-900">AIeasy</p>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-teal-600">
              Website Design Company in Delhi
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Premium, lead-focused website design for businesses that want a cleaner online presence and more enquiries from Google Ads, SEO and mobile traffic.
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-600 lg:text-right">
            <a href="mailto:hello@aieasy.in" className="inline-flex items-center gap-2 transition hover:text-[#0D9488]">
              <Mail className="h-4 w-4" />
              hello@aieasy.in
            </a>
            <div className="flex items-center gap-2 lg:justify-end">
              <Phone className="h-4 w-4" />
              +91 98XXX XXXXX
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-slate-200/80" />

        <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AIeasy. All rights reserved.</p>
          <Link href="/" className="transition hover:text-[#0D9488]">
            Back to AIeasy main site
          </Link>
        </div>
      </div>
    </footer>
  );
}
