"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop",
    title: "Modern Corporate Website",
    description: "Clean, professional design for businesses",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop",
    title: "E-Commerce Platform",
    description: "High-converting online store design",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=675&fit=crop",
    title: "Creative Agency Site",
    description: "Stunning visuals for creative brands",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1200&h=675&fit=crop",
    title: "SaaS Dashboard",
    description: "Modern web application interface",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=675&fit=crop",
    title: "Tech Startup Landing",
    description: "Conversion-focused startup design",
  },
];

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="container mt-12">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slides[currentIndex].image}
                alt={slides[currentIndex].title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-2 text-xl font-bold text-white sm:text-2xl"
                >
                  {slides[currentIndex].title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-white/90 sm:text-base"
                >
                  {slides[currentIndex].description}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1A1A1A] shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1A1A1A] shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-6 bg-[#0D9488]"
                    : "bg-white/60 hover:bg-white"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-6 flex justify-center gap-3 overflow-x-auto px-4 pb-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(index)}
            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-32 ${
              index === currentIndex
                ? "border-[#0D9488] ring-2 ring-[#0D9488]/20"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
