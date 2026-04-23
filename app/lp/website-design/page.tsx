import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Star } from "lucide-react";

import { Button } from "@/components/ui/button";

import { LpFooter } from "./components/LpFooter";
import { LpHeader } from "./components/LpHeader";
import { BenefitsSection } from "./components/BenefitsSection";
import { HeroSlider } from "./components/HeroSlider";
import { LeadForm } from "./components/LeadForm";
import { PortfolioSection } from "./components/PortfolioSection";
import { PricingSection } from "./components/PricingSection";

export const metadata: Metadata = {
  title: "Website Design & Development | AIeasy",
  description:
    "Professional website design and development starting at ₹9,999. Get a mobile-responsive, SEO-ready website delivered in 7-14 days.",
};

export default function WebsiteDesignLandingPage() {
  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#10231f]">
      <LpHeader />
      <main className="overflow-hidden">
        <section className="relative isolate border-b border-[#d9ece8] bg-[linear-gradient(180deg,#f7fcfb_0%,#fffdf8_58%,#fffdf8_100%)] pt-28 sm:pt-32">
          <div className="absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.16),transparent_38%),radial-gradient(circle_at_top_left,rgba(20,184,166,0.12),transparent_32%)]" />
          <div className="container pb-16 sm:pb-20 lg:pb-24">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:gap-14">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#bfe4de] bg-white/85 px-4 py-2 text-sm font-medium text-[#0d9488] shadow-sm backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  Dedicated landing experience for Google Ads traffic
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-[#0f1f1c] sm:text-5xl lg:text-6xl">
                    Professional Website Design &amp; Development Starting at ₹9,999 Only
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-[#4e6763] sm:text-xl">
                    Get a stunning, mobile-responsive website that converts visitors into customers. Delivered in 7-14 days.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full bg-[#0d9488] px-7 text-sm font-semibold text-white shadow-lg shadow-[#0d9488]/20 hover:bg-[#0f766e]"
                  >
                    <Link href="#lead-form">
                      Get Your Free Quote
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-sm font-medium text-[#4e6763]">
                    No hidden fees • One-time payment • Free consultation
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { value: "7-14 days", label: "Typical launch window" },
                    { value: "100%", label: "Mobile responsive layouts" },
                    { value: "1 year", label: "Support included" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[1.5rem] border border-[#dceae6] bg-white/95 p-5 shadow-sm"
                    >
                      <p className="text-2xl font-semibold text-[#10231f]">{stat.value}</p>
                      <p className="mt-2 text-sm text-[#5f7773]">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-[#33524d]">
                  {[
                    "Conversion-focused design",
                    "SEO-ready structure",
                    "WhatsApp + lead form setup",
                    "Built for local businesses",
                  ].map((item) => (
                    <div
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full bg-[#eef8f6] px-4 py-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#0d9488]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <HeroSlider />
                <div className="flex flex-wrap items-center gap-4 rounded-[1.5rem] border border-[#dceae6] bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-1 text-[#f59e0b]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-[#4e6763]">
                    Fast-turnaround website packages for startups, local businesses, clinics, agencies, and service brands.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <BenefitsSection />
        <PortfolioSection />
        <PricingSection />

        <section id="lead-form" className="scroll-mt-24 bg-[#f8fcfb] py-20 sm:py-24">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
              <div className="space-y-6">
                <div className="inline-flex rounded-full border border-[#bfe4de] bg-white px-4 py-2 text-sm font-medium text-[#0d9488]">
                  Free consultation
                </div>
                <div className="space-y-4">
                  <h2 className="text-balance text-3xl font-semibold tracking-tight text-[#10231f] sm:text-4xl">
                    Get Your Free Website Quote
                  </h2>
                  <p className="max-w-2xl text-lg leading-8 text-[#5f7773]">
                    Tell us a bit about your business and what you need. We&apos;ll send a tailored quote, delivery timeline, and recommended website package.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "Custom layout tailored to your business goals",
                    "Lead capture forms, WhatsApp CTA, and conversion sections",
                    "SEO-ready pages with fast-loading structure",
                    "Consultation available before you decide",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.5rem] border border-[#dceae6] bg-white p-5 text-sm leading-6 text-[#33524d] shadow-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <LeadForm />
            </div>
          </div>
        </section>
      </main>
      <LpFooter />
    </div>
  );
}
