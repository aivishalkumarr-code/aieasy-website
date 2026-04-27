import Image from "next/image";
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
      <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-24 lg:px-8">
        <Link href="/" className="relative h-14 w-[220px] shrink-0 sm:w-[270px]" aria-label="aicosy home">
          <Image
            src="/logo.png"
            alt="aicosy | AI Made Easy"
            fill
            className="object-contain object-left"
            sizes="(min-width: 640px) 270px, 220px"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[#475569] transition-colors hover:text-[#2563EB]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <ScrollToLeadCta className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:px-6">
          <span className="hidden sm:inline">Get Free Consultation</span>
          <span className="sm:hidden">Free Consultation</span>
        </ScrollToLeadCta>
      </div>
    </header>
  );
}
