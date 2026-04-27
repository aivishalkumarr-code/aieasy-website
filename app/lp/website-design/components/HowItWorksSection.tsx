import { ArrowRight, CheckCircle2, LayoutTemplate, MessageSquareText, Rocket } from "lucide-react";

import { AnimatedSection } from "./AnimatedSection";
import { ScrollToLeadCta } from "./ScrollToLeadCta";

const steps = [
  {
    icon: MessageSquareText,
    title: "Share Your Vision",
    description: "Fill the form and tell us about your business, goals, and the kind of customers you want to attract.",
  },
  {
    icon: LayoutTemplate,
    title: "Get Custom Design",
    description: "We create a unique design mockup in 48 hours so you can see the direction before development starts.",
  },
  {
    icon: CheckCircle2,
    title: "Review & Approve",
    description: "You review the design, we refine it, and we keep iterating until it feels right for your brand.",
  },
  {
    icon: Rocket,
    title: "Go Live & Grow",
    description: "Your website launches, your offer becomes clearer, and customers have a faster path to contact or buy.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="container py-20 sm:py-24">
      <AnimatedSection className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2563EB]">
          How it works
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-[#1A1A1A] sm:text-4xl">
          A simple 4-step process from idea to launch.
        </h2>
        <p className="mt-4 text-lg leading-8 text-[#6B7280]">
          No complicated process. No endless project drag. Just a fast, structured path to a website that starts helping your business grow.
        </p>
      </AnimatedSection>

      <div className="mt-12 grid gap-6 lg:grid-cols-4">
        {steps.map((step, index) => (
          <AnimatedSection key={step.title} delay={index * 0.06}>
            <div className="relative h-full rounded-[1.8rem] border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="text-4xl font-semibold tracking-tight text-[#2563EB]/20">0{index + 1}</div>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#1A1A1A]">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#6B7280]">{step.description}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection className="mt-10 flex justify-center">
        <ScrollToLeadCta
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#2563EB] px-8 text-base font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Get My Free Website Quote Now
          <ArrowRight className="h-5 w-5" />
        </ScrollToLeadCta>
      </AnimatedSection>
    </section>
  );
}
