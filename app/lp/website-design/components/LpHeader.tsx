"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { ScrollToLeadCta } from "./ScrollToLeadCta";

const links = [
  { label: "Benefits", href: "#benefits" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
] as const;

export function LpHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB]/80 bg-[#fafaf8]/92 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#0D9488] text-base font-bold text-white shadow-sm">
            A
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-[#1A1A1A]">AIeasy</p>
            <p className="hidden text-xs text-[#6B7280] sm:block">Websites built to grow revenue</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0D9488]"
            >
              {link.label}
            </a>
          ))}
          <ScrollToLeadCta
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#0D9488] px-6 text-sm font-semibold text-white transition hover:bg-[#0f766e]"
          >
            Get Free Consultation
          </ScrollToLeadCta>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1A1A1A] lg:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-[#E5E7EB] bg-white lg:hidden">
          <div className="container flex flex-col gap-4 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#6B7280]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <ScrollToLeadCta
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#0D9488] px-6 text-sm font-semibold text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Free Consultation
            </ScrollToLeadCta>
          </div>
        </div>
      ) : null}
    </header>
  );
}
