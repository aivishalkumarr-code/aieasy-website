import type { Metadata } from "next";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

import { AnimatedSection } from "@/app/components/AnimatedSection";
import { Footer } from "@/app/components/Footer";
import { LeadForm } from "@/app/components/LeadForm";
import { Navigation } from "@/app/components/Navigation";

export const metadata: Metadata = {
  title: "Contact AIeasy | Let’s build something together",
  description:
    "Contact AIeasy to plan your next AI automation, web application, generative AI, or website project.",
};

const contactItems = [
  {
    label: "Email",
    value: "hello@aieasy.in",
    icon: Mail,
  },
  {
    label: "Phone",
    value: "+91 98XXX XXXXX",
    icon: Phone,
  },
  {
    label: "Location",
    value: "Delhi, India",
    icon: MapPin,
  },
  {
    label: "Response time",
    value: "Within 24 hours",
    icon: Clock3,
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main className="pb-24 pt-28">
        <section className="container">
          <AnimatedSection className="max-w-3xl space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
              Contact
            </p>
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-[#1A1A1A] sm:text-6xl">
              Let&apos;s build something together
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#6B7280]">
              Tell us what you&apos;re building, what needs to improve, and where AI can create leverage. We&apos;ll come back with a practical next step.
            </p>
          </AnimatedSection>
        </section>

        <section className="container py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <AnimatedSection className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-[#1A1A1A]">
                  Reach the team directly
                </h2>
                <p className="text-lg leading-8 text-[#6B7280]">
                  Whether you need AI automation, a new website, AI agents, or a custom software build, we can scope the right starting point quickly.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {contactItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-5 shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0D9488]/10 text-[#0D9488]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-5 text-sm font-medium uppercase tracking-[0.2em] text-[#6B7280]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#1A1A1A]">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1} direction="left">
              <LeadForm />
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
