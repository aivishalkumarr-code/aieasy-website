"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    title: "Corporate lead-generation website",
    description: "A trust-focused homepage designed to turn search traffic into qualified consultation requests.",
    result: "B2B services company • 3.1x more demo inquiries",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    title: "E-commerce storefront built to sell",
    description: "High-converting product pages, persuasive offers, and mobile-first checkout experiences.",
    result: "Retail brand • 40% increase in online sales",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    title: "Service business website with instant trust",
    description: "Clear messaging, strong proof, and faster paths to booking or calling your team.",
    result: "Local agency • 27 qualified leads in 14 days",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1600&q=80",
    title: "Premium brand site that looks expensive",
    description: "A polished digital presence that helps you stand out from low-trust competitors.",
    result: "Boutique brand • 35% lift in conversion rate",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1600&q=80",
    title: "Modern website that keeps mobile visitors engaged",
    description: "Built for speed, clarity, and frictionless action on every screen size.",
    result: "Healthcare provider • 2x more appointment requests",
  },
] as const;

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const currentSlide = slides[currentIndex];

  return (
    <div className="rounded-[1.6rem] border border-[#E5E7EB] bg-white p-3 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.28)] sm:p-5">
      <div className="relative overflow-hidden rounded-[1.35rem]">
        <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#2563EB] shadow-sm backdrop-blur sm:left-6 sm:top-6">
          <Sparkles className="h-3.5 w-3.5" />
          Beautiful, conversion-focused website designs
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-[1.2rem] bg-[#F3F4F6] md:aspect-[16/8]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={currentSlide.image}
                alt={currentSlide.title}
                fill
                priority={currentIndex === 0}
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/88 via-[#0f172a]/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur">
                  {currentSlide.result}
                </p>
                <h2 className="mt-4 max-w-2xl text-2xl font-semibold text-white sm:text-3xl">
                  {currentSlide.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
                  {currentSlide.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            aria-label="Previous screenshot"
            className="absolute left-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1A1A1A] shadow-lg transition hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
            aria-label="Next screenshot"
            className="absolute right-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1A1A1A] shadow-lg transition hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-5">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`group overflow-hidden rounded-2xl border text-left transition ${
              index === currentIndex
                ? "border-[#2563EB] bg-[#EFF6FF] shadow-sm"
                : "border-[#E5E7EB] bg-white hover:border-[#2563EB]/30"
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="(max-width: 640px) 50vw, 220px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-medium text-[#1A1A1A]">{slide.title}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
