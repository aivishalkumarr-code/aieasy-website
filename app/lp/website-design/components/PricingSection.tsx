import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  SectionIntro,
  primaryButtonClass,
  sectionContainerClass,
  sectionPaddingClass,
  secondaryButtonClass,
} from "./LandingPrimitives";
import { pricingTiers } from "./landingPageContent";
import { ScrollToLeadCta } from "./ScrollToLeadCta";

export function PricingSection() {
  return (
    <section id="pricing" className={sectionPaddingClass}>
      <div className={sectionContainerClass}>
        <SectionIntro
          eyebrow="Pricing"
          title="Simple website packages with clear starting points."
          description="Choose the package that fits your current stage. Each option is structured to keep the launch practical, fast and easy to understand."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative flex h-full rounded-2xl border bg-white transition duration-200 hover:-translate-y-1",
                tier.featured
                  ? "scale-100 border-teal-500 shadow-[0_20px_60px_rgba(13,148,136,0.18)] lg:scale-[1.02]"
                  : "border-slate-200/70 shadow-[0_20px_60px_rgba(15,148,136,0.12)] hover:border-teal-200",
              )}
            >
              <CardContent className="flex h-full w-full flex-col p-6 sm:p-7">
                {tier.featured ? (
                  <Badge className="absolute left-6 top-0 -translate-y-1/2 rounded-full bg-[#0D9488] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    Most Popular
                  </Badge>
                ) : null}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {tier.name}
                  </p>
                  <div className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
                    {tier.price}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {tier.description}
                  </p>
                </div>

                <Separator className="my-6 bg-slate-200/80" />

                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Best suited for
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                    {tier.outcome}
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0D9488]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-1 items-end">
                  <Button
                    asChild
                    className={cn(
                      tier.featured ? primaryButtonClass : secondaryButtonClass,
                      "h-12 w-full",
                    )}
                  >
                    <ScrollToLeadCta>{tier.cta}</ScrollToLeadCta>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
