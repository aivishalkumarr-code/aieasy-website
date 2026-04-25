import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { sectionContainerClass, sectionPaddingClass } from "./LandingPrimitives";
import { ScrollToLeadCta } from "./ScrollToLeadCta";

export function FinalCtaSection() {
  return (
    <section className={sectionPaddingClass}>
      <div className={sectionContainerClass}>
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-700 to-teal-500 px-6 py-10 text-center text-white shadow-[0_30px_80px_rgba(15,148,136,0.22)] sm:px-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
            Ready to start?
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Build a Website That Brings More Enquiries?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            Get a clear website plan, pricing direction and the fastest route to a professional launch for your business.
          </p>
          <Button
            asChild
            className="mt-8 h-12 rounded-full bg-white px-6 text-sm font-semibold text-[#0D9488] transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-[#0F766E] sm:px-7 sm:text-base"
          >
            <ScrollToLeadCta>
              Get Free Consultation
              <ArrowRight className="h-4 w-4" />
            </ScrollToLeadCta>
          </Button>
        </div>
      </div>
    </section>
  );
}
