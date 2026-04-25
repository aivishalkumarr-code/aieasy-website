import type { Metadata } from "next";

import { BenefitsSection } from "./components/BenefitsSection";
import { HeroSlider } from "./components/HeroSlider";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { LeadForm } from "./components/LeadForm";
import { LpFooter } from "./components/LpFooter";
import { LpHeader } from "./components/LpHeader";
import { PortfolioSection } from "./components/PortfolioSection";
import { PricingSection } from "./components/PricingSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { ScrollToLeadCta } from "./components/ScrollToLeadCta";

export const metadata: Metadata = {
  title:
    "Get a High-Converting Website That Grows Your Business | AIeasy - Starting at ₹9,999",
  description:
    "Stop losing customers with a basic website. Get a professional, lead-generating website that works 24/7 for your business, starting at just ₹9,999.",
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

const heroProof = [
  "Delivered in 7-14 days",
  "1-Year Free Support",
  "100+ Happy Clients",
] as const;

const heroHighlights = [
  "Built to generate inquiries, not just look nice",
  "Perfect on mobile where most customers discover you",
  "Designed to build trust from the first click",
] as const;

export default function WebsiteDesignLandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#1A1A1A]">
      <LpHeader />

      <main className="overflow-x-clip">
        <section className="relative isolate overflow-hidden border-b border-[#E5E7EB] bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.14),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.14),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#fafaf8_100%)] pb-16 pt-10 sm:pt-14 lg:pb-20 lg:pt-16">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(13,148,136,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(13,148,136,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
          <div className="container relative">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-start">
              <div className="max-w-2xl pt-4 lg:pt-8">
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#0D9488]/15 bg-white/85 px-4 py-2 text-sm font-medium text-[#0D9488] shadow-sm backdrop-blur">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#0D9488]" />
                  Limited availability for this month&apos;s launches
                </div>
                <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-[#1A1A1A] sm:text-5xl lg:text-6xl">
                  Get a High-Converting Website That Grows Your Business – Starting at Just ₹9,999
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4B5563] sm:text-xl">
                  Stop losing customers with a basic website. Get a professional, lead-generating website that works 24/7 for your business.
                </p>
                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <ScrollToLeadCta
                    className="inline-flex h-14 items-center justify-center rounded-full bg-[#0D9488] px-8 text-base font-semibold text-white shadow-[0_18px_45px_-20px_rgba(13,148,136,0.8)] transition hover:bg-[#0f766e]"
                  >
                    Get Your Free Website Consultation
                  </ScrollToLeadCta>
                  <p className="text-sm font-medium text-[#6B7280]">
                    Free consultation worth ₹2,000. No obligation quote.
                  </p>
                </div>
                <p className="mt-5 text-sm font-medium text-[#1A1A1A] sm:text-base">
                  {heroProof.join(" • ")}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {heroHighlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur"
                    >
                      <p className="text-sm font-medium leading-6 text-[#374151]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <LeadForm />
            </div>

            <div className="mt-10 rounded-[2rem] border border-white/80 bg-white/65 p-3 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur sm:mt-14 sm:p-5">
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
