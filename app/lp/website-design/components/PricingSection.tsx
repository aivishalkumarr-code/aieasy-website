import { Check, ShieldCheck } from "lucide-react";

import { AnimatedSection } from "./AnimatedSection";
import { ScrollToLeadCta } from "./ScrollToLeadCta";

const tiers = [
  {
    name: "Starter",
    price: "₹9,999",
    description: "Perfect for local businesses that need a professional website fast.",
    features: ["5 pages", "Mobile responsive", "Basic SEO", "1-year support"],
    featured: false,
  },
  {
    name: "Business",
    price: "₹19,999",
    description: "Best for businesses that want more leads, better tracking, and a stronger funnel.",
    features: ["10 pages", "Lead capture forms", "Advanced SEO", "Analytics", "1-year support"],
    featured: true,
  },
  {
    name: "Premium",
    price: "₹34,999",
    description: "For brands that need a bigger build, e-commerce, or custom functionality.",
    features: ["Unlimited pages", "E-commerce", "Custom features", "Priority support", "2-year support"],
    featured: false,
  },
] as const;

export function PricingSection() {
  return (
    <section id="pricing" className="container scroll-mt-28 py-20 sm:py-24">
      <AnimatedSection className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0D9488]">
          Pricing
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-[#1A1A1A] sm:text-4xl">
          Simple, Transparent Pricing
        </h2>
        <p className="mt-4 text-lg leading-8 text-[#6B7280]">
          Choose the website package that matches your current stage. Every tier is designed to help you launch faster and grow with confidence.
        </p>
      </AnimatedSection>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier, index) => (
          <AnimatedSection key={tier.name} delay={index * 0.07}>
            <div
              className={`relative flex h-full flex-col rounded-[2rem] border p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                tier.featured
                  ? "border-[#0D9488] bg-white shadow-[0_25px_60px_-40px_rgba(13,148,136,0.45)]"
                  : "border-[#E5E7EB] bg-white"
              }`}
            >
              {tier.featured ? (
                <div className="absolute left-8 top-0 -translate-y-1/2 rounded-full bg-[#0D9488] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  Most popular
                </div>
              ) : null}

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6B7280]">{tier.name}</p>
                <div className="mt-4 text-4xl font-semibold tracking-tight text-[#1A1A1A]">{tier.price}</div>
                <p className="mt-4 text-sm leading-7 text-[#6B7280]">{tier.description}</p>
              </div>

              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-[#4B5563]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10 text-[#0D9488]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-1 flex-col justify-end gap-4">
                <ScrollToLeadCta
                  className={`inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition ${
                    tier.featured
                      ? "bg-[#0D9488] text-white hover:bg-[#0f766e]"
                      : "bg-[#1A1A1A] text-white hover:bg-[#0f172a]"
                  }`}
                >
                  Get Started
                </ScrollToLeadCta>
                <p className="text-center text-xs font-medium text-[#6B7280]">
                  Limited onboarding spots available each month.
                </p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection className="mt-8">
        <div className="flex flex-col items-center justify-center gap-3 rounded-[1.8rem] border border-[#0D9488]/15 bg-[#f0fdfa] px-6 py-5 text-center sm:flex-row sm:text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0D9488] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-[#1A1A1A] sm:text-base">
            100% Satisfaction Guaranteed • Full Source Code Delivered
          </p>
        </div>
      </AnimatedSection>
    </section>
  );
}
