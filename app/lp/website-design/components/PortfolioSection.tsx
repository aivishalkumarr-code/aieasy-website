"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const portfolioItems = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop",
    title: "Corporate Business Site",
    category: "Business",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    title: "E-Commerce Store",
    category: "E-Commerce",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop",
    title: "SaaS Platform",
    category: "Technology",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
    title: "Creative Agency",
    category: "Creative",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1481487484168-9b995ecc168d?w=600&h=400&fit=crop",
    title: "Restaurant Website",
    category: "Food & Beverage",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
    title: "Real Estate Portal",
    category: "Real Estate",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=600&h=400&fit=crop",
    title: "Healthcare Platform",
    category: "Healthcare",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    title: "Educational Portal",
    category: "Education",
  },
];

export function PortfolioSection() {
  return (
    <section id="portfolio" className="bg-white py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#1A1A1A] sm:text-4xl">
            Our Recent Work
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#6B7280]">
            Browse through some of our latest website designs
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-xl bg-[#fafaf8] shadow-sm"
            >
              <div className="aspect-[3/2] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D9488]/90 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="mb-1 text-xs font-medium uppercase tracking-wide text-white/80">
                  {item.category}
                </span>
                <h3 className="mb-4 text-lg font-bold text-white">{item.title}</h3>
                <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0D9488] transition-all hover:bg-white/90">
                  <ExternalLink className="h-4 w-4" />
                  View Live Demo
                </button>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 group-hover:opacity-0">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-white/80">{item.category}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-[#6B7280]">
            All designs are custom-made for our clients. Your website will be unique too.
          </p>
        </div>
      </div>
    </section>
  );
}
