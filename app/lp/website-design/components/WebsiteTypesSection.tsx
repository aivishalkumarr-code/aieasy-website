import { Card, CardContent } from "@/components/ui/card";

import {
  BrowserMockup,
  SectionIntro,
  sectionContainerClass,
} from "./LandingPrimitives";
import { websiteTypes } from "./landingPageContent";

export function WebsiteTypesSection() {
  return (
    <section className="bg-slate-50 py-12 sm:py-14 lg:py-20">
      <div className={sectionContainerClass}>
        <SectionIntro
          eyebrow="Website Types"
          title="Website Designs Built for Delhi Businesses"
          description="Whether you run a clinic, coaching business, real estate service, ecommerce store or local company, we design websites that make your business look trustworthy and easy to contact."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {websiteTypes.map((item) => (
            <Card
              key={item.title}
              className="group h-full rounded-2xl border border-slate-200/70 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
            >
              <CardContent className="flex h-full flex-col p-5">
                <BrowserMockup compact {...item.mockup} />
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#0D9488]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
