import { Card, CardContent } from "@/components/ui/card";

import {
  SectionIntro,
  sectionContainerClass,
  sectionPaddingClass,
} from "./LandingPrimitives";
import { trustCards } from "./landingPageContent";

export function TrustSection() {
  return (
    <section className="bg-slate-50 py-12 sm:py-14 lg:py-20">
      <div className={sectionContainerClass}>
        <SectionIntro
          eyebrow="Why Choose AIeasy"
          title="Why businesses choose AIeasy for website design."
          description="We keep the process clear, the communication fast and the website direction focused on results you can actually use."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {trustCards.map((card) => (
            <Card
              key={card.title}
              className="h-full rounded-2xl border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(15,148,136,0.12)] transition duration-200 hover:-translate-y-1 hover:border-teal-200"
            >
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[#0D9488]">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
