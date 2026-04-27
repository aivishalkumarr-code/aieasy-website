"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";

import { AnimatedSection } from "./AnimatedSection";
import { ScrollToLeadCta } from "./ScrollToLeadCta";

const portfolioItems = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1600&q=80",
    title: "E-commerce Store",
    businessType: "Fashion & apparel",
    result: "40% increase in sales",
    description: "Sharper product presentation, faster mobile browsing, and stronger add-to-cart flows.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80",
    title: "Clinic Website",
    businessType: "Healthcare",
    result: "2x more appointment requests",
    description: "Trust-first messaging with clear appointment paths and mobile-friendly service pages.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1600&q=80",
    title: "Real Estate Funnel Site",
    businessType: "Real estate",
    result: "31 qualified buyer leads in 3 weeks",
    description: "A lead capture flow built around location pages, property trust, and WhatsApp-first actions.",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1600&q=80",
    title: "Premium Brand Website",
    businessType: "Boutique business",
    result: "35% higher conversion rate",
    description: "Premium visuals, social proof, and irresistible offers positioned above the fold.",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    title: "Service Business Lead Site",
    businessType: "Professional services",
    result: "12 leads in the first week",
    description: "Cleaner positioning, stronger trust signals, and a form flow built to capture intent fast.",
  },
] as const;

export function PortfolioSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeItem = portfolioItems[currentIndex];

  return (
    <section id="portfolio" className="scroll-mt-28 bg-white py-20 sm:py-24">
      <div className="container">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2563EB]">
            Portfolio
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-[#1A1A1A] sm:text-4xl">
            Real Websites That Are Growing Real Businesses
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#6B7280]">
            These layouts are built around customer trust, faster decisions, and stronger conversion paths, not vanity design.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-12">
          <div className="overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-[#fafaf8] p-4 shadow-sm sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-stretch">
              <div className="relative overflow-hidden rounded-[1.6rem] bg-[#E5E7EB]">
                <div className="relative aspect-[16/10]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeItem.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={activeItem.image}
                        alt={`${activeItem.title} website screenshot`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 900px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/88 via-[#0f172a]/20 to-transparent" />
                      <div className="absolute inset-0 opacity-0 transition duration-300 hover:opacity-100">
                        <div className="flex h-full items-center justify-center bg-[#2563EB]/82 p-6 backdrop-blur-sm">
                          <ScrollToLeadCta
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#2563EB] shadow-lg"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Live
                          </ScrollToLeadCta>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/75">
                          {activeItem.businessType}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                          {activeItem.title}
                        </h3>
                        <p className="mt-2 text-base font-medium text-[#99f6e4]">
                          {activeItem.result}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[#E5E7EB] bg-white p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2563EB]">
                      Growth snapshot
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[#1A1A1A]">{activeItem.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIndex(
                          (prev) => (prev - 1 + portfolioItems.length) % portfolioItems.length,
                        )
                      }
                      aria-label="Previous portfolio item"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] text-[#1A1A1A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => (prev + 1) % portfolioItems.length)}
                      aria-label="Next portfolio item"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] text-[#1A1A1A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <p className="mt-5 text-base leading-8 text-[#6B7280]">{activeItem.description}</p>

                <div className="mt-6 rounded-[1.4rem] bg-[#f8fafc] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B7280]">
                    Result highlight
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[#1A1A1A]">{activeItem.result}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                    Designed to make the offer clearer, remove hesitation, and get visitors to act faster.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {portfolioItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        index === currentIndex
                          ? "border-[#2563EB] bg-[#EFF6FF]"
                          : "border-[#E5E7EB] bg-white hover:border-[#2563EB]/20"
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#1A1A1A]">{item.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#6B7280]">{item.businessType}</p>
                      <p className="mt-2 text-sm text-[#2563EB]">{item.result}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
