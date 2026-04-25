import Link from "next/link";

import { ScrollToLeadCta } from "./ScrollToLeadCta";

const links = [
  { label: "Benefits", href: "#benefits" },
  { label: "Work", href: "#portfolio" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

export function LpHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0]/80 bg-white shadow-[0_1px_0_rgba(226,232,240,0.55)]">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[76px] lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0D9488] text-base font-bold text-white shadow-sm">
            A
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight text-[#0F172A]">AIeasy</p>
            <p className="truncate text-xs font-medium text-[#64748B]">Website Design Company in Delhi</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[#475569] transition-colors hover:text-[#0D9488]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <ScrollToLeadCta className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#0D9488] px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(13,148,136,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#0F766E] sm:px-6">
          <span className="hidden sm:inline">Get Free Consultation</span>
          <span className="sm:hidden">Free Consultation</span>
        </ScrollToLeadCta>
      </div>
    </header>
  );
}
