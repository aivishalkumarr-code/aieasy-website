"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { primaryButtonClass, sectionContainerClass } from "./LandingPrimitives";
import { navLinks } from "./landingPageContent";
import { ScrollToLeadCta } from "./ScrollToLeadCta";

export function LpHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 14);
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });

    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-slate-200/80 bg-white/80 shadow-[0_20px_60px_rgba(15,148,136,0.08)] backdrop-blur-xl"
          : "bg-white/65 backdrop-blur-sm",
      )}
    >
      <div className={cn(sectionContainerClass, "flex h-16 items-center justify-between gap-4 lg:h-20")}>
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0D9488] text-base font-bold text-white shadow-[0_20px_60px_rgba(15,148,136,0.18)]">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight text-slate-900">AIeasy</p>
            <p className="truncate text-xs text-slate-500 sm:text-sm">
              Website Design Company in Delhi
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3 lg:gap-8">
          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-[#0D9488]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Button asChild className={cn(primaryButtonClass, "h-11 px-5 text-sm sm:px-6")}> 
            <ScrollToLeadCta>
              <span className="sm:hidden">Free Consultation</span>
              <span className="hidden sm:inline">Get Free Consultation</span>
            </ScrollToLeadCta>
          </Button>
        </div>
      </div>
    </header>
  );
}
