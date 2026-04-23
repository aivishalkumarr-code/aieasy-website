import type { Metadata } from "next";
import { BenefitsSection } from "./components/BenefitsSection";
import { HeroSlider } from "./components/HeroSlider";
import { LeadForm } from "./components/LeadForm";
import { LpFooter } from "./components/LpFooter";
import { LpHeader } from "./components/LpHeader";
import { PortfolioSection } from "./components/PortfolioSection";
import { PricingSection } from "./components/PricingSection";

export const metadata: Metadata = {
  title: "Professional Website Design & Development | AIeasy - Starting at ₹9,999",
  description:
    "Get a stunning, mobile-responsive, SEO-ready website starting at just ₹9,999. Fast delivery, modern design, 1-year support. Book your free consultation now.",
  keywords: ["website design", "web development", "Delhi", "India", "₹9999", "AIeasy"],
  openGraph: {
    title: "Professional Website Design & Development | AIeasy",
    description: "Starting at ₹9,999. Fast delivery, SEO-ready, mobile-responsive websites.",
    type: "website",
  },
};

export default function WebsiteDesignLandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <LpHeader />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#fafaf8] pb-16 pt-24">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full bg-[#0D9488]/10 px-4 py-2 text-sm font-medium text-[#0D9488]">
                <span className="mr-2">🔥</span> Limited Time Offer
              </div>
              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-[#1A1A1A] sm:text-5xl lg:text-6xl">
                Professional Website Design & Development
                <span className="block text-[#0D9488]">Starting at ₹9,999 Only</span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-[#6B7280]">
                Get a stunning, mobile-responsive, SEO-ready website that converts visitors into customers. 
                Fast delivery with 1-year free support.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-[#0D9488] px-8 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#14B8A6] hover:shadow-xl"
                >
                  Get Free Consultation
                </a>
                <a
                  href="#portfolio"
                  className="inline-flex h-14 items-center justify-center rounded-full border-2 border-[#E5E7EB] bg-white px-8 text-base font-semibold text-[#1A1A1A] transition-all hover:border-[#0D9488] hover:text-[#0D9488]"
                >
                  View Our Work
                </a>
              </div>
            </div>
          </div>
          
          {/* Hero Image Slider */}
          <HeroSlider />
        </section>

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Portfolio Section */}
        <PortfolioSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* Lead Form Section */}
        <section id="contact" className="py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl">
              <div className="mb-8 text-center">
                <h2 className="mb-4 text-3xl font-bold text-[#1A1A1A]">
                  Ready to Get Started?
                </h2>
                <p className="text-[#6B7280]">
                  Fill out the form below and we&apos;ll get back to you within 24 hours with a custom quote.
                </p>
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
