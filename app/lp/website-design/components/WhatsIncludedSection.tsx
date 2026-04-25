import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  primaryButtonClass,
  sectionContainerClass,
  sectionPaddingClass,
  softCardClass,
} from "./LandingPrimitives";
import { includedItems } from "./landingPageContent";
import { ScrollToLeadCta } from "./ScrollToLeadCta";

export function WhatsIncludedSection() {
  return (
    <section className={sectionPaddingClass}>
      <div className={cn(sectionContainerClass, "grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center") }>
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
            What&apos;s Included
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Everything You Need to Launch a Professional Website
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
            You don&apos;t need to manage five different vendors. We keep the launch
            package simple, practical and focused on getting your business online
            with the essentials already handled.
          </p>
          <Separator className="my-6 bg-slate-200/80" />
          <p className="text-base leading-7 text-slate-600">
            Best for local businesses, service brands and ad campaigns that need
            a clean website with fast turnaround.
          </p>
          <Button asChild className={cn(primaryButtonClass, "mt-8 h-12 gap-2 px-6") }>
            <ScrollToLeadCta>
              Get Free Consultation
              <ArrowRight className="h-4 w-4" />
            </ScrollToLeadCta>
          </Button>
        </div>

        <Card className={cn(softCardClass, "rounded-[28px] border-teal-100 bg-gradient-to-br from-white via-white to-teal-50/70")}>
          <CardContent className="p-6 sm:p-8">
            <div className="rounded-[1.5rem] border border-white/80 bg-white/80 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
                Launch checklist
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                Premium essentials included from day one.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {includedItems.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0D9488]" />
                  <span className="text-sm font-medium leading-6 text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
