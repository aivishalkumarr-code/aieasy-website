import {
  BadgeCheck,
  Gauge,
  Search,
  Smartphone,
  TrendingUp,
  Users,
} from "lucide-react";

import { AnimatedSection } from "./AnimatedSection";

const benefits = [
  {
    icon: Users,
    title: "More Leads & Customers",
    description:
      "Your website becomes a 24/7 sales machine that captures leads while you sleep.",
  },
  {
    icon: TrendingUp,
    title: "Higher Sales Conversion",
    description:
      "Professional design builds trust and turns visitors into paying customers.",
  },
  {
    icon: BadgeCheck,
    title: "Professional Brand Image",
    description:
      "Stand out from competitors with a premium website that screams credibility.",
  },
  {
    icon: Smartphone,
    title: "Mobile Customers Love It",
    description:
      "70% of your customers browse on mobile, so we make every screen convert.",
  },
  {
    icon: Search,
    title: "SEO That Brings Free Traffic",
    description:
      "Rank on Google and get customers without spending on ads for every click.",
  },
  {
    icon: Gauge,
    title: "Lightning Fast Loading",
    description:
      "Slow websites lose customers. Ours are built to load in under 2 seconds.",
  },
] as const;

export function BenefitsSection() {
  return (
    <section id="benefits" className="container scroll-mt-28 py-20 sm:py-24">
      <AnimatedSection className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0D9488]">
          Built for growth
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-[#1A1A1A] sm:text-4xl">
          Your website should grow the business, not just sit online.
        </h2>
        <p className="mt-4 text-lg leading-8 text-[#6B7280]">
          Every section, page, and call-to-action is designed around a simple goal: helping more visitors trust you, contact you, and buy from you.
        </p>
      </AnimatedSection>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {benefits.map((benefit, index) => (
          <AnimatedSection key={benefit.title} delay={index * 0.06}>
            <div className="h-full rounded-[1.8rem] border border-[#E5E7EB] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#0D9488]/20 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#1A1A1A]">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#6B7280]">{benefit.description}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
