import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import {
  BrowserMockup,
  SectionIntro,
  sectionContainerClass,
  sectionPaddingClass,
} from "./LandingPrimitives";
import { portfolioItems } from "./landingPageContent";
import { ScrollToLeadCta } from "./ScrollToLeadCta";

export function PortfolioSection() {
  return (
    <section id="work" className="bg-white py-12 sm:py-14 lg:py-20">
      <div className={sectionContainerClass}>
        <SectionIntro
          eyebrow="Portfolio"
          title="Website Layouts Designed for Real Business Goals"
          description="These layout directions are planned around how a visitor evaluates trust, clarity and action — not around empty design trends."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {portfolioItems.map((item) => (
            <Card
              key={item.title}
              className="h-full rounded-2xl border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(15,148,136,0.12)] transition duration-200 hover:-translate-y-1 hover:border-teal-200"
            >
              <CardContent className="p-5 sm:p-6">
                <BrowserMockup {...item.mockup} />
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
                    {item.websiteType}
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <div className="space-y-2 text-sm leading-6 text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-900">Who it&apos;s for:</span>{" "}
                      {item.audience}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Conversion goal:</span>{" "}
                      {item.goal}
                    </p>
                  </div>
                </div>
                <ScrollToLeadCta className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0D9488] transition hover:text-[#0F766E]">
                  {item.linkLabel}
                  <ArrowRight className="h-4 w-4" />
                </ScrollToLeadCta>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
