import { ArrowRight } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  SectionIntro,
  primaryButtonClass,
  sectionContainerClass,
  sectionPaddingClass,
} from "./LandingPrimitives";
import { faqItems } from "./landingPageContent";
import { ScrollToLeadCta } from "./ScrollToLeadCta";

export function FaqSection() {
  return (
    <section id="faq" className={sectionPaddingClass}>
      <div className={sectionContainerClass}>
        <SectionIntro
          eyebrow="FAQ"
          title="Website Design Questions, Answered"
          description="Answers to the most common questions businesses ask before starting a website project in Delhi."
          className="mx-auto max-w-[820px]"
        />

        <div className="mx-auto mt-12 max-w-[820px] rounded-[28px] border border-slate-200/70 bg-white px-6 shadow-[0_20px_60px_rgba(15,148,136,0.12)] sm:px-8">
          <Accordion type="single" collapsible>
            {faqItems.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mx-auto mt-8 max-w-[820px] text-center">
          <p className="text-base leading-7 text-slate-600">
            Still unsure which website package fits your business?
          </p>
          <Button asChild className={cn(primaryButtonClass, "mt-5 h-12 gap-2 px-6") }>
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
