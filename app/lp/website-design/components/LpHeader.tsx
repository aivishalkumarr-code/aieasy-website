"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

export function LpHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D9488] text-white font-bold">
            A
          </div>
          <span className="text-xl font-bold text-[#1A1A1A]">AIeasy</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#benefits" className="text-sm font-medium text-[#6B7280] hover:text-[#0D9488]">
            Benefits
          </a>
          <a href="#portfolio" className="text-sm font-medium text-[#6B7280] hover:text-[#0D9488]">
            Portfolio
          </a>
          <a href="#pricing" className="text-sm font-medium text-[#6B7280] hover:text-[#0D9488]">
            Pricing
          </a>
          <a
            href="#contact"
            className="rounded-full bg-[#0D9488] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#14B8A6]"
          >
            Get Quote
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-[#1A1A1A]" />
          ) : (
            <Menu className="h-6 w-6 text-[#1A1A1A]" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a
              href="#benefits"
              className="text-base font-medium text-[#6B7280] hover:text-[#0D9488]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Benefits
            </a>
            <a
              href="#portfolio"
              className="text-base font-medium text-[#6B7280] hover:text-[#0D9488]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Portfolio
            </a>
            <a
              href="#pricing"
              className="text-base font-medium text-[#6B7280] hover:text-[#0D9488]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#contact"
              className="rounded-full bg-[#0D9488] px-6 py-3 text-center text-base font-semibold text-white hover:bg-[#14B8A6]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Quote
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
