"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Heart,
  Home,
  Rocket,
  ShoppingCart,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type TouchEvent } from "react";

import { getActivePortfolioItems } from "@/app/dashboard/actions/portfolio";
import { cn } from "@/lib/utils";
import type { PortfolioCategory, PortfolioItem } from "@/types";

import { AnimatedSection } from "./AnimatedSection";
import { ScrollToLeadCta } from "./ScrollToLeadCta";

type FilterValue = "All Projects" | PortfolioCategory;

const filters: Array<{ label: FilterValue; icon?: LucideIcon }> = [
  { label: "All Projects" },
  { label: "Business", icon: Building2 },
  { label: "Healthcare", icon: Heart },
  { label: "E-commerce", icon: ShoppingCart },
  { label: "Education", icon: GraduationCap },
  { label: "Real Estate", icon: Home },
  { label: "Hospitality", icon: UtensilsCrossed },
];

const categoryMeta: Record<PortfolioCategory, { label: string; icon: LucideIcon; accent: string }> = {
  Business: { label: "Finance / Taxation", icon: Briefcase, accent: "from-[#0F172A] to-[#1D4ED8]" },
  Healthcare: { label: "Healthcare", icon: Heart, accent: "from-[#0F766E] to-[#2563EB]" },
  "E-commerce": { label: "E-commerce", icon: ShoppingCart, accent: "from-[#7C3AED] to-[#2563EB]" },
  Education: { label: "Education", icon: GraduationCap, accent: "from-[#B45309] to-[#2563EB]" },
  "Real Estate": { label: "Real Estate", icon: Home, accent: "from-[#047857] to-[#2563EB]" },
  Hospitality: { label: "Hospitality / Restaurant", icon: UtensilsCrossed, accent: "from-[#B91C1C] to-[#2563EB]" },
};

const skeletonCards = Array.from({ length: 3 }, (_, index) => index);

function PortfolioSkeleton() {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-3">
      {skeletonCards.map((item) => (
        <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="aspect-[16/10] animate-pulse bg-slate-100" />
          <div className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-100" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PortfolioCard({ item, priority = false }: { item: PortfolioItem; priority?: boolean }) {
  const meta = categoryMeta[item.category];
  const Icon = meta.icon;
  const linkContent = (
    <>
      View Live Website <ArrowRight className="h-4 w-4" />
    </>
  );

  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={item.image_url}
          alt={`${item.name} website screenshot`}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className={cn("absolute inset-0 bg-gradient-to-tr opacity-55 mix-blend-multiply", meta.accent)} />
        <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur">
          {item.category}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-5 text-white">
          <p className="max-w-[18rem] text-sm font-medium text-white/80">{item.description}</p>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[#0F172A]">{item.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{meta.label}</p>
          </div>
        </div>

        {item.website_url ? (
          <a
            href={item.website_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
          >
            {linkContent}
          </a>
        ) : (
          <ScrollToLeadCta className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]">
            {linkContent}
          </ScrollToLeadCta>
        )}
      </div>
    </article>
  );
}

export function PortfolioSection() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("All Projects");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    getActivePortfolioItems()
      .then((portfolioItems) => {
        if (mounted) {
          setItems(portfolioItems);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = useMemo(
    () =>
      activeFilter === "All Projects"
        ? items
        : items.filter((item) => item.category === activeFilter),
    [activeFilter, items],
  );

  const activeItem = filteredItems[currentIndex] ?? filteredItems[0];

  const changeFilter = (filter: FilterValue) => {
    setActiveFilter(filter);
    setCurrentIndex(0);
  };

  const goToPrevious = () => {
    setCurrentIndex((current) => (current - 1 + filteredItems.length) % filteredItems.length);
  };

  const goToNext = () => {
    setCurrentIndex((current) => (current + 1) % filteredItems.length);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) {
      return;
    }

    const distance = touchStart - event.changedTouches[0].clientX;

    if (Math.abs(distance) > 40) {
      if (distance > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStart(null);
  };

  return (
    <section id="portfolio" className="scroll-mt-28 bg-white py-12 lg:py-24">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2563EB]">OUR WORK</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            Websites That Drive <span className="text-[#2563EB]">Real Results</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#475569] md:text-lg">
            A glimpse of the websites we&apos;ve built that help businesses grow, get leads and increase revenue.
          </p>
        </AnimatedSection>

        <AnimatedSection className="relative mt-8">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent md:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent md:hidden" />
          <div className="flex gap-3 overflow-x-auto px-1 py-2 [scrollbar-width:none] md:flex-wrap md:justify-center [&::-webkit-scrollbar]:hidden">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const active = activeFilter === filter.label;

              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => changeFilter(filter.label)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-[#2563EB]",
                  )}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {filter.label}
                </button>
              );
            })}
          </div>
        </AnimatedSection>

        {isLoading ? <PortfolioSkeleton /> : null}

        {!isLoading && filteredItems.length ? (
          <>
            <div className="mt-12 hidden grid-cols-3 gap-6 lg:grid">
              {filteredItems.map((item, index) => (
                <AnimatedSection key={item.id} delay={index * 0.05}>
                  <PortfolioCard item={item} priority={index < 3} />
                </AnimatedSection>
              ))}
            </div>

            <div className="mt-10 lg:hidden">
              <div
                className="relative"
                onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {activeItem ? (
                    <motion.div
                      key={`${activeItem.id}-${activeFilter}`}
                      initial={{ opacity: 0, x: 36 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -36 }}
                      transition={{ duration: 0.32, ease: "easeInOut" }}
                    >
                      <PortfolioCard item={activeItem} priority />
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {filteredItems.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={goToPrevious}
                      aria-label="Previous portfolio item"
                      className="absolute -left-2 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:border-[#2563EB] hover:text-[#2563EB]"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNext}
                      aria-label="Next portfolio item"
                      className="absolute -right-2 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:border-[#2563EB] hover:text-[#2563EB]"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>

              {filteredItems.length > 1 ? (
                <div className="mt-6 flex justify-center gap-2">
                  {filteredItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Show ${item.name}`}
                      className={cn(
                        "h-2.5 rounded-full transition-all",
                        index === currentIndex ? "w-8 bg-[#2563EB]" : "w-2.5 bg-slate-300",
                      )}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {!isLoading && !filteredItems.length ? (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No portfolio items found for this category.
          </div>
        ) : null}

        <AnimatedSection className="mt-12">
          <div className="flex flex-col gap-6 rounded-2xl bg-blue-50 p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg shadow-blue-600/20">
                <Rocket className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">Want a website like these for your business?</h3>
                <p className="mt-2 text-sm leading-6 text-[#475569]">
                  Let&apos;s build a high-converting website that brings real customers.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {["A", "I", "E"].map((avatar, index) => (
                      <div
                        key={avatar}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-50 bg-white text-xs font-bold text-[#2563EB] shadow-sm"
                        style={{ zIndex: 3 - index }}
                      >
                        {avatar}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A]">100+ Businesses Already Trust Us</p>
                </div>
              </div>
            </div>

            <ScrollToLeadCta className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8]">
              Get Free Consultation
              <ArrowRight className="h-4 w-4" />
            </ScrollToLeadCta>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
