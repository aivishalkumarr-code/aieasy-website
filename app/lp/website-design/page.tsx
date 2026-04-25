import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { BenefitsSection } from "./components/BenefitsSection";
import { FinalCtaSection } from "./components/FinalCtaSection";
import {
  primaryButtonClass,
  sectionContainerClass,
  secondaryButtonClass,
} from "./components/LandingPrimitives";
import { LeadForm } from "./components/LeadForm";
import { LpFooter } from "./components/LpFooter";
import { LpHeader } from "./components/LpHeader";
import { MobileStickyCta } from "./components/MobileStickyCta";
import { PortfolioSection } from "./components/PortfolioSection";
import { PricingSection } from "./components/PricingSection";
import { ProcessSection } from "./components/ProcessSection";
import { FaqSection } from "./components/FaqSection";
import { ScrollToLeadCta } from "./components/ScrollToLeadCta";
import { TrustSection } from "./components/TrustSection";
import { WebsiteTypesSection } from "./components/WebsiteTypesSection";
import { WhatsIncludedSection } from "./components/WhatsIncludedSection";
import { heroBenefitBullets, heroTrustPoints } from "./components/landingPageContent";

export const metadata: Metadata = {
  title:
    "Website Design Company in Delhi | Professional Business Websites from ₹9,999 | AIeasy",
  description:
    "Get a premium, mobile-friendly and SEO-ready website for your Delhi business starting at ₹9,999 with free domain, hosting and support included.",
  keywords: [
    "website design company in Delhi",
    "website design Delhi",
    "business website design Delhi",
    "landing page design Delhi",
    "AIeasy",
  ],
  openGraph: {
    title: "Website Design Company in Delhi | AIeasy",
    description:
      "Professional website design for Delhi businesses that want more leads, better trust and a cleaner online presence.",
    type: "website",
  },
};

export default function WebsiteDesignLandingPage() {
  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900 md:pb-0">
      <LpHeader />

      <main className="overflow-x-clip">
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.12),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(13,148,136,0.08),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] py-12 sm:py-14 lg:py-20">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
          <div className={cn(sectionContainerClass, "grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start lg:gap-14")}>
            <div className="max-w-2xl pt-2 lg:pt-6">
              <Badge variant="outline" className="rounded-full border-teal-100 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-600 shadow-sm">
                Website Design Company in Delhi
              </Badge>
              <h1 className="mt-6 text-4xl font-bold leading-[1.05] text-slate-900 md:text-5xl lg:text-6xl">
                Professional Website Design Company in Delhi for Businesses That Want More Leads
              </h1>
              <p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg">
                Get a custom, mobile-friendly and SEO-ready website starting at ₹9,999 — with free domain, hosting and support included.
              </p>

              <div className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-teal-100 bg-teal-50/70 px-4 py-2 text-sm font-medium text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
                Built for Google Ads, SEO, mobile users and fast loading speed.
              </div>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button asChild className={cn(primaryButtonClass, "h-12 gap-2 px-6")}>
                  <ScrollToLeadCta>
                    Get Free Website Consultation
                    <ArrowRight className="h-4 w-4" />
                  </ScrollToLeadCta>
                </Button>
                <Button asChild variant="outline" className={cn(secondaryButtonClass, "h-12 gap-2 px-6")}>
                  <a href="#pricing">View Website Packages</a>
                </Button>
              </div>

              <p className="mt-4 text-sm font-medium text-slate-500">
                No upfront payment. Get a clear website plan before you decide.
              </p>

              <Separator className="my-8 max-w-xl bg-slate-200/80" />

              <div className="flex flex-wrap gap-2">
                {heroTrustPoints.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {heroBenefitBullets.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-4 shadow-[0_20px_60px_rgba(15,148,136,0.12)]"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0D9488]" />
                    <span className="text-sm font-semibold text-slate-700 sm:text-base">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <LeadForm />
          </div>
        </section>

        <WebsiteTypesSection />
        <BenefitsSection />
        <WhatsIncludedSection />
        <PortfolioSection />
        <PricingSection />
        <TrustSection />
        <ProcessSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      <LpFooter />
      <MobileStickyCta />
    </div>
  );
}
