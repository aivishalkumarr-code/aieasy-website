"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const heroSlides = [
  {
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    alt: "Modern web design workspace with laptop and interface mockups",
    title: "Modern business websites",
  },
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    alt: "Analytics dashboard displayed on a desktop monitor",
    title: "Conversion-ready landing pages",
  },
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    alt: "Team reviewing website wireframes on a large screen",
    title: "Responsive layouts for every screen",
  },
  {
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    alt: "Creative team collaborating on a web development project",
    title: "Designed to support growth",
  },
  {
    src: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80",
    alt: "Close-up of a polished website interface on a laptop screen",
    title: "Clean, premium website experiences",
  },
] as const;

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const activeSlide = heroSlides[activeIndex];

  return (
    <div className="rounded-[2rem] border border-[#dceae6] bg-white p-4 shadow-[0_24px_80px_-40px_rgba(15,118,110,0.45)] sm:p-5">
      <div className="relative aspect-[3/2] overflow-hidden rounded-[1.5rem] bg-[#d8eeea]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.src}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={activeSlide.src}
              alt={activeSlide.alt}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/70 via-[#0f172a]/8 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur">
                Website Design Showcase
              </div>
              <p className="mt-3 text-lg font-semibold text-white sm:text-xl">
                {activeSlide.title}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {heroSlides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isActive ? "w-8 bg-[#0d9488]" : "w-2.5 bg-[#c6d9d6] hover:bg-[#98b8b3]"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
