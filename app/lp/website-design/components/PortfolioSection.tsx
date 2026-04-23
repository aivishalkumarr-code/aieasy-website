import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const portfolioItems = [
  {
    title: "E-commerce Store",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
    alt: "E-commerce store website design mockup on a desktop screen",
  },
  {
    title: "Corporate Site",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    alt: "Corporate business website layout displayed on a monitor",
  },
  {
    title: "Portfolio",
    image:
      "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80",
    alt: "Creative portfolio website interface on a laptop",
  },
  {
    title: "SaaS Landing Page",
    image:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80",
    alt: "SaaS website landing page layout with dashboard preview",
  },
  {
    title: "Clinic Website",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    alt: "Healthcare clinic website design shown on a tablet and laptop",
  },
  {
    title: "Restaurant Website",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    alt: "Restaurant website homepage with food and reservation sections",
  },
] as const;

export function PortfolioSection() {
  return (
    <section className="bg-[#f8fcfb] py-20 sm:py-24">
      <div className="container">
        <div className="mb-10 max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0d9488]">
            Portfolio
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-[#10231f] sm:text-4xl">
            Websites That Drive Results
          </h2>
          <p className="text-lg leading-8 text-[#5f7773]">
            Explore example website styles for businesses that want stronger branding, faster load times, and better lead generation.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {portfolioItems.map((item) => (
            <article
              key={item.title}
              className="group relative overflow-hidden rounded-[1.75rem] border border-[#dceae6] bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1280px) 28vw, (min-width: 768px) 45vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/75 via-[#0f172a]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 translate-y-4 p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Button
                    asChild
                    className="rounded-full bg-white px-5 font-semibold text-[#10231f] hover:bg-[#ecf8f6]"
                  >
                    <Link href="https://example.com" target="_blank" rel="noreferrer">
                      View Live Demo
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <h3 className="text-lg font-semibold text-[#10231f]">{item.title}</h3>
                <span className="rounded-full bg-[#eef8f6] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#0d9488]">
                  Demo
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
