import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Globe2,
  MessageSquare,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  User,
  Zap,
} from "lucide-react";

import { LeadForm } from "./components/LeadForm";
import { LpFooter } from "./components/LpFooter";
import { LpHeader } from "./components/LpHeader";
import { MobileStickyCta } from "./components/MobileStickyCta";
import { ScrollToLeadCta } from "./components/ScrollToLeadCta";

export const metadata: Metadata = {
  title:
    "Website Design Company in Delhi | Professional Web Design Services - AIeasy",
  description:
    "Leading website design company in Delhi. Get a custom, mobile-friendly, SEO-ready business website starting at ₹9,999. Free domain, hosting & support included.",
  keywords: [
    "website design company Delhi",
    "web design Delhi",
    "website design services",
    "business website Delhi",
    "professional website design",
    "website design company India",
    "AIeasy",
  ],
  openGraph: {
    title: "Website Design Company in Delhi | Professional Web Design Services",
    description:
      "Get a custom business website that generates leads. Starting at ₹9,999 with free domain, hosting & SEO.",
    type: "website",
  },
};

const containerClass = "mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8";

const heroBenefits = [
  "Starting at ₹9,999",
  "Free Domain & Hosting for 1 Year",
  "SEO-Friendly + Mobile-Ready",
  "Pay Only When Website Goes Live",
] as const;

const websiteTypes = [
  {
    title: "Business Website",
    description:
      "For service providers, consultants and local companies that need a professional online presence.",
  },
  {
    title: "Ecommerce Website",
    description:
      "For businesses that want to sell products online with clear categories, product pages and checkout flow.",
  },
  {
    title: "Landing Page",
    description:
      "For Google Ads, lead generation campaigns and focused service offers.",
  },
  {
    title: "Real Estate Website",
    description:
      "For property consultants who need to showcase projects and capture buyer enquiries.",
  },
  {
    title: "Clinic / Service Website",
    description:
      "For clinics, salons, repair services, home services and appointment-based businesses.",
  },
] as const;

const benefits: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Clear Business Positioning",
    description:
      "We help explain what you offer, who it is for, and why customers should choose you.",
    icon: MessageSquare,
  },
  {
    title: "Mobile-First Design",
    description:
      "Your website is designed to look clean and work smoothly on phones, where most visitors will see it first.",
    icon: Smartphone,
  },
  {
    title: "Lead-Focused Layout",
    description:
      "Calls, WhatsApp, enquiry forms and quote buttons are placed where visitors are most likely to act.",
    icon: Phone,
  },
  {
    title: "SEO-Ready Structure",
    description:
      "Pages are structured with proper headings, service sections and location-focused content.",
    icon: Search,
  },
  {
    title: "Fast Loading Pages",
    description:
      "Clean design, compressed images and lightweight sections help reduce loading delays.",
    icon: Zap,
  },
  {
    title: "Google Ads Ready",
    description:
      "Landing pages can be built to match your ad message, improve clarity and increase enquiry chances.",
    icon: Rocket,
  },
];

const includedItems = [
  "Custom homepage design",
  "Mobile responsive layout",
  "Basic SEO setup",
  "Contact form integration",
  "WhatsApp / call button",
  "Free domain for 1 year",
  "Free hosting for 1 year",
  "Speed optimization",
  "Google Analytics setup",
  "1-year support",
] as const;

const portfolioExamples = [
  {
    title: "Real Estate Website",
    type: "Project showcase website",
    for: "Property consultants and real estate agencies",
    goal: "Capture buyer enquiries with project pages, location highlights and call CTAs.",
  },
  {
    title: "Ecommerce Website",
    type: "Online store layout",
    for: "Product businesses and D2C brands",
    goal: "Guide shoppers through categories, product details, cart and checkout setup.",
  },
  {
    title: "Clinic Website",
    type: "Appointment-focused website",
    for: "Clinics, salons and appointment-based services",
    goal: "Make services, timings, location and booking actions easy to find on mobile.",
  },
  {
    title: "Service Business Website",
    type: "Lead generation website",
    for: "Consultants, agencies and local service companies",
    goal: "Explain services clearly and turn visitors into calls, WhatsApp chats and form leads.",
  },
] as const;

const pricingPlans = [
  {
    name: "Starter Website",
    price: "₹9,999",
    badge: undefined,
    description: "Best for new businesses that need a clean online presence.",
    cta: "Start with Starter",
    features: [
      "Up to 5 pages",
      "Mobile responsive design",
      "Contact form",
      "Basic SEO setup",
      "Free domain & hosting for 1 year",
      "1-year support",
    ],
  },
  {
    name: "Business Website",
    price: "₹19,999",
    badge: "Most Popular",
    description:
      "Best for businesses that want more leads, better content and a stronger website structure.",
    cta: "Choose Business Plan",
    features: [
      "Up to 10 pages",
      "Lead generation sections",
      "WhatsApp / call CTA",
      "Advanced SEO structure",
      "Google Analytics setup",
      "Free domain & hosting for 1 year",
      "1-year support",
    ],
  },
  {
    name: "Premium Website",
    price: "₹34,999",
    badge: undefined,
    description:
      "Best for ecommerce, custom layouts, larger websites or businesses that need more functionality.",
    cta: "Discuss Premium Website",
    features: [
      "Custom pages",
      "Ecommerce or advanced functionality",
      "Product/service page structure",
      "Conversion-focused copy sections",
      "Priority support",
      "2-year support",
    ],
  },
] as const;

const trustCards: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Clear Pricing",
    description: "Know the website cost before you start.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Communication",
    description: "Get quick updates during design and development.",
    icon: Clock,
  },
  {
    title: "Conversion-Focused Design",
    description: "Your website is planned around enquiries, not just visuals.",
    icon: Rocket,
  },
  {
    title: "Support After Launch",
    description: "We help with basic updates and guidance after your site goes live.",
    icon: CheckCircle2,
  },
];

const processSteps = [
  {
    title: "Share Your Requirement",
    description:
      "Tell us about your business, services, goals and preferred website style.",
  },
  {
    title: "Get Website Plan & Pricing",
    description:
      "We suggest the right package, content structure and launch timeline.",
  },
  {
    title: "Review the Design",
    description:
      "You review the homepage direction and request changes before final development.",
  },
  {
    title: "Launch Your Website",
    description:
      "Once approved, your website goes live with domain, hosting, forms and basic SEO setup.",
  },
] as const;

const faqs = [
  {
    question: "How much does website design cost in Delhi?",
    answer:
      "Our website packages start from ₹9,999. The final cost depends on the number of pages, features, ecommerce needs and content requirements.",
  },
  {
    question: "How long does it take to build a website?",
    answer:
      "Most business websites can be completed within 7–14 days after content and requirements are confirmed.",
  },
  {
    question: "Do you provide domain and hosting?",
    answer: "Yes, selected packages include free domain and hosting for 1 year.",
  },
  {
    question: "Will my website be mobile-friendly?",
    answer:
      "Yes, every website is designed for mobile, tablet and desktop users.",
  },
  {
    question: "Can you build ecommerce websites?",
    answer:
      "Yes, we can design ecommerce websites with product pages, categories, cart and checkout setup.",
  },
  {
    question: "Do I need to pay upfront?",
    answer:
      "For eligible website packages, you can review the plan first and pay when the website is ready to go live. We’ll confirm the exact payment terms before starting.",
  },
] as const;

function SectionIntro({
  eyebrow,
  title,
  description,
  centered = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[#475569] md:text-lg">{description}</p>
    </div>
  );
}

function BrowserMockup({ title, compact = false }: { title: string; compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-8 items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 h-3 flex-1 rounded-full bg-white" />
      </div>
      <div className={compact ? "space-y-3 p-4" : "space-y-4 p-4"}>
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded-full bg-teal-100" />
            <div className="h-4 w-4/5 rounded-full bg-slate-800" />
            <div className="h-4 w-2/3 rounded-full bg-slate-800" />
            <div className="h-2.5 w-full rounded-full bg-slate-200" />
            <div className="h-2.5 w-4/5 rounded-full bg-slate-200" />
          </div>
          <div className="rounded-xl bg-gradient-to-br from-teal-100 to-slate-100 p-3">
            <div className="h-full min-h-20 rounded-lg border border-white/70 bg-white/70" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-10 rounded-xl bg-teal-50" />
          <div className="h-10 rounded-xl bg-slate-100" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="h-3 w-28 rounded-full bg-slate-200" />
          <div className="h-8 w-24 rounded-full bg-[#2563EB]" />
        </div>
        <span className="sr-only">{title} browser mockup</span>
      </div>
    </div>
  );
}

function CheckItem({ children }: { children: string }) {
  return (
    <li className="flex gap-3 text-sm leading-6 text-[#475569]">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
      <span>{children}</span>
    </li>
  );
}

export default function WebsiteDesignLandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      <LpHeader />

      <main className="overflow-x-clip pb-20 lg:pb-0">
        <section className="relative overflow-hidden bg-white pb-14 pt-10 lg:pb-20 lg:pt-16">
          <div className={containerClass}>
            <div className="grid items-center gap-y-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:gap-x-16">
              <div className="max-w-[560px]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
                  WEBSITE DESIGN COMPANY IN DELHI
                </p>
                <h1 className="mt-4 text-4xl font-bold leading-[1.04] tracking-tight text-[#0F172A] md:text-5xl lg:text-[56px]">
                  Get a Website That Brings You More Business
                </h1>
                <p className="mt-5 text-base leading-relaxed text-[#475569] md:text-lg">
                  Get a custom, mobile-friendly and SEO-ready website starting at ₹9,999 — with free domain, hosting and support included.
                </p>
                <p className="mt-3 text-sm font-medium text-[#64748B]">
                  Built for Google Ads, SEO, mobile users and fast loading speed.
                </p>

                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <ScrollToLeadCta className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-7 text-base font-semibold text-white shadow-[0_12px_30px_rgba(13,148,136,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:w-auto">
                    Get Free Website Consultation
                  </ScrollToLeadCta>
                  <a
                    href="#pricing"
                    className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#E2E8F0] bg-white px-7 text-base font-semibold text-[#0F172A] transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50 sm:w-auto"
                  >
                    View Website Packages
                  </a>
                </div>
                <p className="mt-3 text-sm text-[#64748B]">
                  No upfront payment. Get a clear website plan before you decide.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
                  {heroBenefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
                      <span className="text-sm font-semibold leading-6 text-[#334155]">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative w-full max-w-[560px] justify-self-end self-start">
                <div className="absolute -inset-8 -z-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.20),rgba(236,253,245,0.45)_38%,rgba(255,255,255,0)_72%)] blur-2xl" />
                <div className="relative z-10">
                  <LeadForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="website-types" className="bg-[#F8FAFC] py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="WEBSITE TYPES"
              title="Website Designs Built for Delhi Businesses"
              description="Whether you run a clinic, coaching business, real estate service, ecommerce store or local company, we design websites that make your business look trustworthy and easy to contact."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
              {websiteTypes.map((item, index) => (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:col-span-2 [&:nth-child(4)]:lg:col-start-2"
                >
                  <BrowserMockup title={item.title} compact />
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">
                      0{index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-[#0F172A]">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#475569]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="benefits" className="bg-white py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="BUILT TO CONVERT"
              title="Your website should bring enquiries, not just sit online."
              description="We design every page with a clear message, fast mobile experience, strong calls-to-action and trust-building sections, so visitors know why they should contact you."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <article key={benefit.title} className="flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">{benefit.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#475569]">{benefit.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFC] py-12 lg:py-24">
          <div className={containerClass}>
            <div className="grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
              <div>
                <SectionIntro
                  eyebrow="WHAT’S INCLUDED"
                  title="Everything You Need to Launch a Professional Website"
                  description="From design to domain, hosting, forms and basic SEO setup — we help you launch with everything required to look professional online."
                  centered={false}
                />
                <ScrollToLeadCta className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-7 text-base font-semibold text-white shadow-[0_12px_30px_rgba(13,148,136,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:w-auto">
                  Get My Free Website Plan
                </ScrollToLeadCta>
              </div>
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {includedItems.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2563EB]" />
                      <span className="text-sm font-semibold text-[#334155]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="portfolio" className="bg-white py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="WEBSITE EXAMPLES"
              title="Website Layouts Designed for Real Business Goals"
              description="Explore website styles for service businesses, ecommerce stores, consultants, clinics and local companies."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {portfolioExamples.map((item) => (
                <article key={item.title} className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                  <BrowserMockup title={item.title} />
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">{item.type}</p>
                    <h3 className="mt-2 text-xl font-bold text-[#0F172A]">{item.title}</h3>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-[#475569]">
                      <p><span className="font-semibold text-[#0F172A]">Who it is for:</span> {item.for}</p>
                      <p><span className="font-semibold text-[#0F172A]">Main conversion goal:</span> {item.goal}</p>
                    </div>
                    <ScrollToLeadCta className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]">
                      View Example <ArrowRight className="h-4 w-4" />
                    </ScrollToLeadCta>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 bg-[#F8FAFC] py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="PRICING"
              title="Simple Website Design Packages"
              description="Choose the website package that matches your business stage. If you’re not sure, we’ll recommend the right option after your free consultation."
            />
            <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan) => {
                const featured = Boolean(plan.badge);
                return (
                  <article
                    key={plan.name}
                    className={`flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition-all ${
                      featured
                        ? "border-[#2563EB] shadow-[0_20px_60px_rgba(13,148,136,0.18)] lg:scale-[1.02]"
                        : "border-[#E2E8F0]"
                    }`}
                  >
                    <div className="flex min-h-7 items-center justify-between gap-3">
                      {plan.badge ? (
                        <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2563EB]">
                          {plan.badge}
                        </span>
                      ) : (
                        <span />
                      )}
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-[#0F172A]">{plan.name}</h3>
                    <p className="mt-3 text-4xl font-bold tracking-tight text-[#0F172A]">{plan.price}</p>
                    <p className="mt-4 min-h-16 text-sm leading-6 text-[#475569]">{plan.description}</p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <CheckItem key={feature}>{feature}</CheckItem>
                      ))}
                    </ul>
                    <ScrollToLeadCta
                      className={`mt-8 inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                        featured
                          ? "bg-[#2563EB] text-white shadow-lg shadow-teal-600/20 hover:bg-[#1D4ED8]"
                          : "border border-[#E2E8F0] bg-white text-[#0F172A] hover:border-teal-200 hover:bg-teal-50"
                      }`}
                    >
                      {plan.cta}
                    </ScrollToLeadCta>
                  </article>
                );
              })}
            </div>
            <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 rounded-3xl border border-teal-100 bg-white p-6 text-center shadow-sm sm:flex-row sm:justify-between sm:text-left">
              <p className="text-base font-semibold text-[#334155]">
                Not sure which package is right? Get a free recommendation based on your business.
              </p>
              <ScrollToLeadCta className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:w-auto">
                Get Free Recommendation
              </ScrollToLeadCta>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="WHY CHOOSE AIEASY"
              title="A simple, transparent website design experience."
              description="Work with a team focused on clear scope, clean execution and a website your customers can trust."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {trustCards.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#475569]">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFC] py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="HOW IT WORKS"
              title="A simple 4-step website design process."
              description="From first requirement to launch, you get a clear plan and checkpoints before your website goes live."
            />
            <div className="relative mt-12 grid gap-5 lg:grid-cols-4">
              <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-[#E2E8F0] lg:block" />
              {processSteps.map((step, index) => (
                <article key={step.title} className="relative rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB] text-lg font-bold text-white shadow-[0_12px_30px_rgba(13,148,136,0.22)]">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#475569]">{step.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 text-center">
              <ScrollToLeadCta className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-7 text-base font-semibold text-white shadow-[0_12px_30px_rgba(13,148,136,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:w-auto">
                Start My Website Plan
              </ScrollToLeadCta>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-white py-12 lg:py-24">
          <div className={containerClass}>
            <SectionIntro
              eyebrow="FAQ"
              title="Website Design Questions, Answered"
              description="Clear answers before you request your free website plan."
            />
            <div className="mx-auto mt-10 max-w-[820px] space-y-3">
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0} className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[#0F172A] [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] text-[#2563EB] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-[#475569]">{faq.answer}</p>
                </details>
              ))}
            </div>
            <div className="mt-10 text-center">
              <ScrollToLeadCta className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-7 text-base font-semibold text-white shadow-[0_12px_30px_rgba(13,148,136,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] sm:w-auto">
                Get Free Consultation
              </ScrollToLeadCta>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-[1180px] overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 to-teal-500 px-6 py-14 text-center text-white shadow-[0_28px_80px_rgba(13,148,136,0.26)] sm:px-10 lg:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">FINAL CALL TO GROW</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
              Ready to Build a Website That Brings More Enquiries?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/86 md:text-lg">
              Tell us about your business and we’ll suggest the right website package, pricing direction and launch timeline.
            </p>
            <ScrollToLeadCta className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-[#2563EB] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#EFF6FF] sm:w-auto">
              Get Free Website Consultation
            </ScrollToLeadCta>
            <p className="mt-4 text-sm text-white/80">No spam. No pressure. Just a clear website plan.</p>
          </div>
        </section>
      </main>

      <LpFooter />
      <MobileStickyCta />
    </div>
  );
}
