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
    "Get a High-Converting Website That Grows Your Business | AIeasy - Starting at ₹9,999",
  description:
    "Get a professional website that grows your business. Starting at just ₹9,999 with free domain, hosting, and SEO. Pay only when your website goes live.",
  keywords: [
    "website design",
    "high-converting website",
    "lead generation website",
    "business website India",
    "website design Delhi",
    "AIeasy",
  ],
  openGraph: {
    title: "Get a High-Converting Website That Grows Your Business | AIeasy",
    description:
      "Professional, mobile-first business websites that generate leads, build trust, and help you grow.",
    type: "website",
  },
};

const trustBadges = [
  "Free Domain & Hosting for 1 Year",
  "Fully SEO Optimized",
  "Pay Only After Website Goes Live",
  "Delivered in 7-14 Days",
  "1-Year Free Support",
] as const;

export default function WebsiteDesignLandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#1A1A1A]">
      <LpHeader />

      <main className="overflow-x-clip">
        {/* Clean Hero Section */}
        <section className="relative overflow-hidden bg-white pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
          <div className="container">
            <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Side - Clean Copy */}
              <div className="flex flex-col justify-center pt-4 lg:pt-8">
                <h1 className="text-balance text-4xl font-bold tracking-tight text-[#1A1A1A] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
                  Get a High-Converting Website That Grows Your Business
                </h1>

                <p className="mt-6 text-lg text-[#6B7280]">
                  Starting at just ₹9,999 • Free Domain + Hosting • SEO Friendly • Pay Only When Website is Live
                </p>

                <a
                  href="#lead-form"
                  className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-full bg-[#0D9488] px-8 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#0f766e] hover:shadow-xl sm:w-auto sm:self-start"
                >
                  Get Your Free Consultation – No Upfront Cost
                </a>

                {/* Clean Trust Badges */}
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {trustBadges.map((badge) => (
                    <div key={badge} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0D9488]/10">
                        <Check className="h-3.5 w-3.5 text-[#0D9488]" />
                      </div>
                      <span className="text-sm font-medium text-[#374151]">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Lead Form */}
              <div id="lead-form" className="lg:sticky lg:top-24">
                <LeadForm />
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Slider Section */}
        <section className="bg-[#fafaf8] py-12 lg:py-16">
          <div className="container">
            <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-4 shadow-lg sm:p-6">
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
