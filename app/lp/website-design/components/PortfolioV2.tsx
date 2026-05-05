"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  GraduationCap,
  HeartPulse,
  Headphones,
  Home,
  Rocket,
  SearchCheck,
  ShoppingBag,
  Smartphone,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { PortfolioCategory, PortfolioItem } from "@/types";

import { AnimatedSection } from "./AnimatedSection";
import { ScrollToLeadCta } from "./ScrollToLeadCta";

type FilterValue = "All Projects" | PortfolioCategory;

type PortfolioCopy = {
  brand: string;
  category: PortfolioCategory;
  industry: string;
  headline: string;
  image: string;
  stats: Array<{ value: string; label: string }>;
};

interface PortfolioV2Props {
  items?: PortfolioItem[];
  autoPlay?: boolean;
}

const filters: FilterValue[] = [
  "All Projects",
  "Business",
  "Healthcare",
  "E-commerce",
  "Education",
  "Real Estate",
  "Hospitality",
];

const portfolioCopies: PortfolioCopy[] = [
  {
    brand: "Elite Taxation",
    category: "Business",
    industry: "Finance",
    headline: "Maximize Refunds. Minimize Stress.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&h=680&fit=crop",
    stats: [
      { value: "8,500+", label: "Returns" },
      { value: "98%", label: "Satisfaction" },
      { value: "$2M+", label: "Refunds" },
      { value: "7+", label: "Years" },
    ],
  },
  {
    brand: "CareWell Clinic",
    category: "Healthcare",
    industry: "Healthcare",
    headline: "Compassionate Care For Better Health",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&h=680&fit=crop",
    stats: [
      { value: "12K+", label: "Patients" },
      { value: "4.9", label: "Rating" },
      { value: "24/7", label: "Booking" },
      { value: "38%", label: "More Leads" },
    ],
  },
  {
    brand: "Luxora Fashion",
    category: "E-commerce",
    industry: "E-commerce",
    headline: "New Season New You",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&h=680&fit=crop",
    stats: [
      { value: "3.2x", label: "Sales" },
      { value: "56%", label: "Mobile" },
      { value: "1.8s", label: "Load" },
      { value: "42%", label: "Repeat" },
    ],
  },
  {
    brand: "Bright Future Academy",
    category: "Education",
    industry: "Education",
    headline: "Education Today Success Tomorrow",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&h=680&fit=crop",
    stats: [
      { value: "2,400+", label: "Students" },
      { value: "92%", label: "Results" },
      { value: "6", label: "Programs" },
      { value: "45%", label: "Inquiries" },
    ],
  },
  {
    brand: "UrbanSpace Realty",
    category: "Real Estate",
    industry: "Real Estate",
    headline: "Find The Perfect Place To Call Home",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1000&h=680&fit=crop",
    stats: [
      { value: "180+", label: "Listings" },
      { value: "64%", label: "Leads" },
      { value: "9", label: "Locations" },
      { value: "4.8", label: "Trust" },
    ],
  },
  {
    brand: "Taste Heaven",
    category: "Hospitality",
    industry: "Hospitality",
    headline: "Delicious Food Great Experience",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&h=680&fit=crop",
    stats: [
      { value: "22K+", label: "Orders" },
      { value: "4.9", label: "Reviews" },
      { value: "35%", label: "Bookings" },
      { value: "15", label: "Minutes" },
    ],
  },
];

const featureIcons: Array<{ title: string; icon: LucideIcon }> = [
  { title: "Custom Designs", icon: Code2 },
  { title: "Mobile First", icon: Smartphone },
  { title: "SEO Ready", icon: SearchCheck },
  { title: "Fast Loading", icon: Zap },
  { title: "24/7 Support", icon: Headphones },
];

const defaultFeatures = featureIcons.map((feature) => feature.title);

const categoryIcons: Record<PortfolioCategory, LucideIcon> = {
  Business: Building2,
  Healthcare: HeartPulse,
  "E-commerce": ShoppingBag,
  Education: GraduationCap,
  "Real Estate": Home,
  Hospitality: UtensilsCrossed,
};

const getCopyKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const fallbackItems: PortfolioItem[] = portfolioCopies.map((item, index) => ({
  id: getCopyKey(item.brand),
  title: item.brand,
  name: item.brand,
  category: item.category,
  image_url: item.image,
  image_id: null,
  client_name: item.brand,
  website_url: null,
  live_url: null,
  description: item.headline,
  stats: item.stats,
  features: defaultFeatures,
  order_index: index + 1,
  display_order: index + 1,
  is_active: true,
}));

const getDisplayItem = (item: PortfolioItem) => {
  const copy = portfolioCopies.find((entry) => getCopyKey(entry.brand) === getCopyKey(item.title)) ??
    portfolioCopies.find((entry) => entry.category === item.category) ??
    portfolioCopies[0];

  return {
    ...copy,
    id: item.id,
    brand: item.title || copy.brand,
    category: item.category,
    image: item.image_url || copy.image,
    headline: item.description?.trim() || copy.headline,
    stats: item.stats?.length ? item.stats : copy.stats,
    features: item.features?.length ? item.features : defaultFeatures,
    websiteUrl: item.live_url ?? item.website_url,
  };
};

export function PortfolioV2({ items: initialItems, autoPlay = true }: PortfolioV2Props) {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems?.length ? initialItems : fallbackItems);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("All Projects");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setItems(initialItems?.length ? initialItems : fallbackItems);
  }, [initialItems]);

  const filteredItems = useMemo(
    () => (activeFilter === "All Projects" ? items : items.filter((item) => item.category === activeFilter)),
    [activeFilter, items],
  );

  const displayItems = useMemo(() => filteredItems.map(getDisplayItem), [filteredItems]);
  const activeItem = displayItems[currentIndex] ?? displayItems[0];

  const changeFilter = (filter: FilterValue) => {
    setActiveFilter(filter);
    setCurrentIndex(0);
    setDirection(1);
  };

  const goTo = (index: number) => {
    if (!displayItems.length) {
      return;
    }

    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex((index + displayItems.length) % displayItems.length);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((current) => (current - 1 + displayItems.length) % displayItems.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((current) => (current + 1) % displayItems.length);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 60) {
      return;
    }

    if (info.offset.x < 0) {
      goToNext();
    } else {
      goToPrevious();
    }
  };

  const getOffsetItem = (offset: number) => {
    if (!displayItems.length) {
      return null;
    }

    return displayItems[(currentIndex + offset + displayItems.length) % displayItems.length];
  };

  useEffect(() => {
    if (!autoPlay || displayItems.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setDirection(1);
      setCurrentIndex((current) => (current + 1) % displayItems.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [autoPlay, displayItems.length]);

  return (
    <section id="portfolio" className="scroll-mt-28 overflow-hidden bg-white py-12 lg:py-24">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2563EB]">OUR PORTFOLIO</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
            Websites That Actually Bring <span className="text-[#2563EB]">Results</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#475569] md:text-lg">
            A glimpse of the websites we&apos;ve built that help businesses grow, get leads and increase revenue.
          </p>
        </AnimatedSection>

        <AnimatedSection className="relative mt-8">
          <div className="flex gap-3 overflow-x-auto px-1 py-2 [scrollbar-width:none] md:flex-wrap md:justify-center [&::-webkit-scrollbar]:hidden">
            {filters.map((filter) => {
              const active = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => changeFilter(filter)}
                  className={cn(
                    "inline-flex shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    active
                      ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-[#2563EB]",
                  )}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </AnimatedSection>

        {activeItem ? (
          <AnimatedSection className="mt-10 lg:mt-14">
            <div className="relative mx-auto max-w-6xl">
              <div className="pointer-events-none absolute inset-y-6 -left-16 hidden w-40 bg-gradient-to-r from-white to-transparent lg:block" />
              <div className="pointer-events-none absolute inset-y-6 -right-16 hidden w-40 bg-gradient-to-l from-white to-transparent lg:block" />

              <div className="relative min-h-[560px] sm:min-h-[610px] lg:min-h-[570px]">
                {[-1, 1].map((offset) => {
                  const item = getOffsetItem(offset);
                  const Icon = item ? categoryIcons[item.category] : Building2;

                  return item && displayItems.length > 1 ? (
                    <motion.article
                      key={`${item.id}-${offset}-${activeFilter}`}
                      className={cn(
                        "absolute top-10 hidden w-[30%] overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl lg:block",
                        offset < 0 ? "left-0" : "right-0",
                      )}
                      initial={{ opacity: 0, x: offset * 60, scale: 0.86 }}
                      animate={{ opacity: 0.55, x: 0, scale: 0.88 }}
                      transition={{ duration: 0.35 }}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                        <Image src={item.image} alt={`${item.brand} website screenshot`} fill sizes="30vw" className="object-cover" />
                        <div className="absolute inset-0 bg-slate-950/55" />
                        <div className="absolute bottom-0 p-6 text-white">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="mt-4 text-xl font-bold">{item.brand}</h3>
                          <p className="mt-2 text-sm text-white/75">{item.headline}</p>
                        </div>
                      </div>
                    </motion.article>
                  ) : null;
                })}

                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.article
                    key={`${activeItem.id}-${activeFilter}`}
                    custom={direction}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.12}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, x: direction * 80, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: direction * -80, scale: 0.96 }}
                    transition={{ duration: 0.38, ease: "easeInOut" }}
                    className="relative z-10 mx-auto max-w-[760px] cursor-grab overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.16)] active:cursor-grabbing"
                  >
                    <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 sm:aspect-[16/9]">
                      <Image
                        src={activeItem.image}
                        alt={`${activeItem.brand} website screenshot`}
                        fill
                        sizes="(max-width: 1024px) 92vw, 760px"
                        priority
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/42 to-slate-950/10" />
                      <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                        {activeItem.industry}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">{activeItem.brand}</p>
                        <h3 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-5xl">{activeItem.headline}</h3>
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {activeItem.stats.map((stat) => (
                            <div key={`${stat.value}-${stat.label}`} className="rounded-2xl border border-white/15 bg-white/12 p-3 backdrop-blur">
                              <p className="text-lg font-bold sm:text-2xl">{stat.value}</p>
                              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/70">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                          <Clock3 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">Built for speed, trust, and conversion</p>
                          <p className="mt-1 text-sm text-slate-500">Responsive website design with conversion-focused sections.</p>
                        </div>
                      </div>
                      {activeItem.websiteUrl ? (
                        <a
                          href={activeItem.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#2563EB] px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8]"
                        >
                          View Live Website
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <ScrollToLeadCta className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#2563EB] px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8]">
                          View Live Website
                          <ArrowRight className="h-4 w-4" />
                        </ScrollToLeadCta>
                      )}
                    </div>
                  </motion.article>
                </AnimatePresence>
              </div>

              {displayItems.length > 1 ? (
                <div className="mt-6 flex flex-col items-center justify-between gap-5 sm:flex-row">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={goToPrevious}
                      aria-label="Previous portfolio item"
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#2563EB] hover:text-[#2563EB]"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNext}
                      aria-label="Next portfolio item"
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#1D4ED8]"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {displayItems.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => goTo(index)}
                        aria-label={`Show ${item.brand}`}
                        className={cn(
                          "flex items-center gap-2 rounded-full px-2 py-1 text-xs font-bold transition",
                          currentIndex === index ? "text-[#2563EB]" : "text-slate-400 hover:text-slate-600",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                        <span className={cn("h-px transition-all", currentIndex === index ? "w-8 bg-[#2563EB]" : "w-4 bg-slate-300")} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </AnimatedSection>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No portfolio items found for this category.
          </div>
        )}

        <AnimatedSection className="mt-12">
          <div className="grid gap-3 rounded-[2rem] border border-slate-100 bg-[#F8FAFC] p-4 sm:grid-cols-2 lg:grid-cols-5">
            {featureIcons.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-[#0F172A]">{feature.title}</p>
                </div>
              );
            })}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-8">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-[#2563EB] to-blue-500 p-6 text-white shadow-[0_28px_80px_rgba(37,99,235,0.28)] sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <Rocket className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
                    Want a website like these for your business?
                  </h3>
                  <div className="mt-5 flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {["A", "I", "E", "+"].map((avatar, index) => (
                        <div
                          key={`${avatar}-${index}`}
                          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500 bg-white text-xs font-bold text-[#2563EB] shadow-sm"
                          style={{ zIndex: 4 - index }}
                        >
                          {avatar}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-white/82">100+ growing businesses trust AIeasy</p>
                  </div>
                </div>
              </div>

              <ScrollToLeadCta className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#2563EB] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#EFF6FF]">
                Get Free Consultation
                <ArrowRight className="h-4 w-4" />
              </ScrollToLeadCta>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
