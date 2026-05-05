"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  GraduationCap,
  Heart,
  Home,
  Rocket,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { PortfolioCategory, PortfolioItem } from "@/types";

import { ScrollToLeadCta } from "./ScrollToLeadCta";

const categories: Array<{ label: PortfolioCategory; icon: LucideIcon }> = [
  { label: "Business", icon: Building2 },
  { label: "Healthcare", icon: Heart },
  { label: "E-commerce", icon: ShoppingCart },
  { label: "Education", icon: GraduationCap },
  { label: "Real Estate", icon: Home },
  { label: "Hospitality", icon: UtensilsCrossed },
];

const categoryIcons: Record<PortfolioCategory, LucideIcon> = {
  Business: Briefcase,
  Healthcare: Heart,
  "E-commerce": ShoppingCart,
  Education: GraduationCap,
  "Real Estate": Home,
  Hospitality: UtensilsCrossed,
};

const categoryLabels: Record<PortfolioCategory, string> = {
  Business: "Finance / Taxation",
  Healthcare: "Healthcare",
  "E-commerce": "E-commerce",
  Education: "Education",
  "Real Estate": "Real Estate",
  Hospitality: "Hospitality / Restaurant",
};

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const Icon = categoryIcons[item.category] ?? Briefcase;
  const href = item.website_url || "#contact";

  return (
    <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={item.image_url}
          alt={`${item.name} website screenshot`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-white/0" />
        <div className="absolute left-4 right-4 top-4 overflow-hidden rounded-xl border border-white/30 bg-white/90 shadow-lg backdrop-blur">
          <div className="flex h-7 items-center gap-1.5 border-b border-slate-200 px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            <span className="ml-2 h-2 flex-1 rounded-full bg-slate-100" />
          </div>
          <div className="grid grid-cols-[1.1fr_0.9fr] gap-3 p-3">
            <div>
              <div className="mb-2 h-2 w-12 rounded-full bg-blue-100" />
              <p className="text-xs font-bold leading-tight text-slate-950">
                {item.name === "Elite Taxation" ? "Maximize Refunds. Minimize Stress." : item.name}
              </p>
              <div className="mt-2 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-slate-200" />
                <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="rounded-lg bg-blue-50/90 p-2">
              <div className="h-full min-h-12 rounded-md bg-white/80" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#2563EB] shadow-sm backdrop-blur">
            {categoryLabels[item.category]}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-[#0F172A]">{item.name}</h3>
            <p className="mt-1 text-sm text-[#64748B]">{categoryLabels[item.category]}</p>
          </div>
        </div>
        <a
          href={href}
          target={item.website_url ? "_blank" : undefined}
          rel={item.website_url ? "noreferrer" : undefined}
          className="shrink-0 text-sm font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
        >
          View Live Website <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          <div className="aspect-[16/10] animate-pulse bg-slate-100" />
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-full bg-slate-100" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PortfolioShowcase({ items }: { items: PortfolioItem[] }) {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory | "All Projects">("All Projects");
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredItems = useMemo(
    () =>
      activeCategory === "All Projects"
        ? items
        : items.filter((item) => item.category === activeCategory),
    [activeCategory, items],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory]);

  const activeItem = filteredItems[activeIndex] ?? filteredItems[0];

  const goPrevious = () => {
    setActiveIndex((current) => (filteredItems.length ? (current - 1 + filteredItems.length) % filteredItems.length : 0));
  };

  const goNext = () => {
    setActiveIndex((current) => (filteredItems.length ? (current + 1) % filteredItems.length : 0));
  };

  return (
    <section id="portfolio" className="bg-white py-12 lg:py-24">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">OUR WORK</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            Websites That Drive <span className="text-[#2563EB]">Real Results</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#475569] md:text-lg">
            A glimpse of the websites we&apos;ve built that help businesses grow, get leads and increase revenue.
          </p>
        </div>

        <div className="relative mx-auto mt-8 max-w-full lg:max-w-5xl">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-white to-transparent md:hidden" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-white to-transparent md:hidden" />
          <div className="flex gap-3 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:justify-center md:overflow-visible md:pb-0">
            <button
              type="button"
              onClick={() => setActiveCategory("All Projects")}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                activeCategory === "All Projects"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-[#2563EB]",
              )}
            >
              All Projects
            </button>
            {categories.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.label;

              return (
                <button
                  key={category.label}
                  type="button"
                  onClick={() => setActiveCategory(category.label)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-[#2563EB]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {!items.length ? <PortfolioSkeleton /> : null}

        {filteredItems.length ? (
          <>
            <div className="mt-12 hidden gap-6 lg:grid lg:grid-cols-3">
              {filteredItems.map((item) => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>

            <div className="relative mt-10 lg:hidden">
              <div className="overflow-hidden px-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeItem.id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    <PortfolioCard item={activeItem} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {filteredItems.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goPrevious}
                    className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#2563EB] shadow-lg ring-1 ring-slate-200"
                    aria-label="Previous portfolio item"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#2563EB] shadow-lg ring-1 ring-slate-200"
                    aria-label="Next portfolio item"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <div className="mt-6 flex justify-center gap-2">
                    {filteredItems.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                          "h-2 rounded-full transition-all",
                          index === activeIndex ? "w-8 bg-[#2563EB]" : "w-2 bg-slate-300",
                        )}
                        aria-label={`Show ${item.name}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="mt-12 rounded-2xl bg-blue-50 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg shadow-blue-600/20">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">Want a website like these for your business?</h3>
                <p className="mt-2 text-sm leading-6 text-[#475569] md:text-base">
                  Let&apos;s build a high-converting website that brings real customers.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <span className="h-9 w-9 rounded-full border-2 border-blue-50 bg-gradient-to-br from-blue-200 to-blue-500" />
                    <span className="h-9 w-9 rounded-full border-2 border-blue-50 bg-gradient-to-br from-emerald-200 to-emerald-500" />
                    <span className="h-9 w-9 rounded-full border-2 border-blue-50 bg-gradient-to-br from-amber-200 to-amber-500" />
                  </div>
                  <p className="text-sm font-semibold text-[#334155]">100+ Businesses Already Trust Us</p>
                </div>
              </div>
            </div>
            <ScrollToLeadCta className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.20)] transition hover:-translate-y-0.5 hover:bg-[#1D4ED8]">
              Get Free Consultation <ArrowRight className="h-4 w-4" />
            </ScrollToLeadCta>
          </div>
        </div>
      </div>
    </section>
  );
}
