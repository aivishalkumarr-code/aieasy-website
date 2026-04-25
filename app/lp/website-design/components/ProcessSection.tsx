import { Card, CardContent } from "@/components/ui/card";

import {
  SectionIntro,
  sectionContainerClass,
  sectionPaddingClass,
} from "./LandingPrimitives";
import { processSteps } from "./landingPageContent";

export function ProcessSection() {
  return (
    <section className={sectionPaddingClass}>
      <div className={sectionContainerClass}>
        <SectionIntro
          eyebrow="Process"
          title="A simple 4-step website design process."
          description="You get a straightforward path from requirement to launch without unnecessary confusion or agency-style delays."
        />

        <div className="relative mt-12">
          <div className="absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent lg:block" />
          <div className="grid gap-5 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <Card
                key={step.title}
                className="relative h-full rounded-2xl border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(15,148,136,0.12)]"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[#0D9488]">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="text-4xl font-bold tracking-tight text-teal-100">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
