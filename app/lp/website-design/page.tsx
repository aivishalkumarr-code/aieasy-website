import type { Metadata } from "next";
import { Check } from "lucide-react";

import { BenefitsSection } from "./components/BenefitsSection";
import { HeroSlider } from "./components/HeroSlider";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { LeadForm } from "./components/LeadForm";
import { LpFooter } from "./components/LpFooter";
import { LpHeader } from "./components/LpHeader";
import { PortfolioSection } from "./components/PortfolioSection";
import { PricingSection } from "./components/PricingSection";
import { TestimonialsSection } from "./components/TestimonialsSection";

export const metadata: Metadata = {
  title:
    "Website Design Company in Delhi | Professional Web Design Services - AIeasy",
  description:
    "Leading website design company in Delhi. Get a custom, mobile-friendly, SEO-ready business website starting at ₹9,999. Free domain, hosting & support included.",
  keywords: [
    "website design company Delhi",
    "web design Delhi",
    "website design services",
    "business website Delhi",
    "professional website design",
    "website design company India",
    "AIeasy",
  ],
  openGraph: {
    title: "Website Design Company in Delhi | Professional Web Design Services",
    description:
      "Get a custom business website that generates leads. Starting at ₹9,999 with free domain, hosting & SEO.",
    type: "website",
  },
};

const heroBenefits = [
  "Starting at ₹9,999",
  "Free Domain & Hosting for 1 Year",
  "SEO-Friendly + Mobile-Ready",
  "Pay Only When Website Goes Live",
] as const;

export default function WebsiteDesignLandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#1A1A1A]">
      <LpHeader />

      <main className="overflow-x-clip">
        {/* Premium Hero Section - Delhi Focused */}
        <section className="relative overflow-hidden bg-white pb-16 pt-12 sm:pt-16 lg:pb-20 lg:pt-16">
          <div className="container">
            <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
              {/* Left Side - Delhi Website Design Company Copy */}
              <div className="flex flex-col justify-center pt-2 lg:pt-4">
                {/* Eyebrow */}
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
                  Website Design Company in Delhi
                </p>

                {/* Main Headline */}
                <h1 className="mt-4 text-balance text-[2rem] font-bold leading-[1.2] tracking-tight text-[#111827] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                  Professional Website Design Company in Delhi for Businesses That Want More Leads
                </h1>

                {/* Subheadline */}
                <p className="mt-5 text-lg leading-relaxed text-[#475569]">
                  Get a custom, mobile-friendly and SEO-ready website starting at ₹9,999 — with free domain, hosting and support included.
                </p>

                {/* Trust Line */}
                <p className="mt-3 text-sm text-[#64748B]">
                  Built for Google Ads, SEO, mobile users and fast loading speed.
                </p>

                {/* Primary CTA */}
                <a
                  href="#lead-form"
                  className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#0D9488] px-6 text-base font-semibold text-white shadow-md transition-all hover:bg-[#0F766E] hover:shadow-lg sm:w-auto sm:self-start"
                >
                  Get Free Website Consultation
                </a>

                {/* Microcopy */}
                <p className="mt-3 text-sm text-[#64748B]">
                  No upfront payment. Get a clear website plan before you decide.
                </p>

                {/* Clean Benefit Bullets - Only 4 */}
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {heroBenefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5]">
                        <Check className="h-3 w-3 text-[#0D9488]" />
                      </div>
                      <span className="text-sm font-medium text-[#374151]">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Clean Lead Form */}
              <div id="lead-form" className="lg:sticky lg:top-20">
                <LeadForm />
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Slider Section */}
        <section className="bg-[#fafaf8] py-10 lg:py-14">
          <div className="container">
            <div className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-3 shadow-sm sm:p-4">
              <HeroSlider />
            </div>
          </div>
        </section>

        <BenefitsSection />
        <PortfolioSection />
        <PricingSection />
        <TestimonialsSection />
        <HowItWorksSection />
      </main>

      <LpFooter />
    </div>
  );
}
