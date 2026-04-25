import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { ScrollToLeadCta } from "./ScrollToLeadCta";

export function LpFooter() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="container py-16 sm:py-20">
        <div className="overflow-hidden rounded-[2rem] border border-[#0D9488]/15 bg-[linear-gradient(135deg,#0f766e_0%,#0D9488_55%,#14B8A6_100%)] px-6 py-10 text-center text-white shadow-[0_30px_80px_-45px_rgba(13,148,136,0.75)] sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
            Final call to grow
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to Grow Your Business?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
            Let&apos;s build a website that earns trust, brings in more customers, and makes every ad click work harder for your business.
          </p>
          <ScrollToLeadCta
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-[#0D9488] transition hover:bg-[#ecfeff]"
          >
            Get My Free Website Quote Now
          </ScrollToLeadCta>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-[#E5E7EB] pt-8 text-sm text-[#6B7280] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight text-[#1A1A1A]">AIeasy</p>
            <p className="mt-1 max-w-md leading-6">
              Conversion-focused websites for businesses that want more leads, more trust, and faster growth.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <a href="mailto:hello@aieasy.in" className="inline-flex items-center gap-2 hover:text-[#0D9488]">
              <Mail className="h-4 w-4" />
              hello@aieasy.in
            </a>
            <div className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" />
              +91 98XXX XXXXX
            </div>
            <Link href="/" className="hover:text-[#0D9488]">
              Back to AIeasy main site
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
