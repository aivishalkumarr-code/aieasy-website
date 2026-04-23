import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { AnimatedSection } from "@/app/components/AnimatedSection";
import { BlogCard } from "@/app/components/BlogCard";
import { DeployOnSection } from "@/app/components/DeployOnSection";
import { Footer } from "@/app/components/Footer";
import { LeadForm } from "@/app/components/LeadForm";
import { Navigation } from "@/app/components/Navigation";
import { ServiceCard } from "@/app/components/ServiceCard";
import { TestimonialCard } from "@/app/components/TestimonialCard";
import { serviceIconMap } from "@/app/services/icon-map";
import { SERVICE_PAGE_LIST } from "@/app/services/service-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "AIeasy | Premium AI solutions company in Delhi",
  description:
    "AIeasy designs, automates, and ships AI experiences for service businesses across automation, software, web, and generative AI.",
};

const services = SERVICE_PAGE_LIST.map((service) => ({
  icon: serviceIconMap[service.iconName],
  title: service.name,
  description: service.description,
  href: `/services/${service.slug}`,
}));

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "CTO",
    company: "Northstar Labs",
    rating: 5,
    quote:
      "AIeasy transformed our lead qualification workflow. Response times dropped 62% and we're closing 3x more qualified deals.",
    initials: "AM",
  },
  {
    name: "Sophia Carter",
    role: "Head of Growth",
    company: "BrightFrame",
    rating: 5,
    quote:
      "The website redesign + AI content engine they built delivered 41% more demo requests in the first 90 days.",
    initials: "SC",
  },
  {
    name: "Ishaan Kapoor",
    role: "Founder",
    company: "PulseOps",
    rating: 5,
    quote:
      "Their team understood our operations complexity immediately. The dashboard they built is 2.4x faster for our support triage.",
    initials: "IK",
  },
  {
    name: "Maya Chen",
    role: "VP Marketing",
    company: "Atlas Growth",
    rating: 5,
    quote:
      "The AI content engine produces SEO-ready briefs at scale. Our organic traffic is up 78% in 6 months.",
    initials: "MC",
  },
  {
    name: "Rohan Gupta",
    role: "CEO",
    company: "CallPilot",
    rating: 5,
    quote:
      "IVR setup was seamless. Call qualification accuracy went from 60% to 91% and appointment booking doubled.",
    initials: "RG",
  },
  {
    name: "Priya Sharma",
    role: "Operations Director",
    company: "TechBridge",
    rating: 5,
    quote:
      "AIeasy built custom AI agents that now handle our entire onboarding flow. 15 hours saved per week per team member.",
    initials: "PS",
  },
] as const;

const blogPosts = [
  {
    title: "How AI Automation Changes Service Delivery for Lean Teams",
    excerpt:
      "A practical framework for identifying repeatable workflows, prioritizing automation ROI, and keeping humans in the loop.",
    publishedAt: "2026-03-12",
    author: "AIeasy Studio",
    category: "Automation",
    slug: "ai-automation-service-delivery",
  },
  {
    title: "Designing AI Product Demos That Convert Enterprise Buyers",
    excerpt:
      "What to show, how to structure the experience, and where teams lose trust during interactive product demonstrations.",
    publishedAt: "2026-02-27",
    author: "AIeasy Studio",
    category: "Product",
    slug: "ai-product-demos-enterprise-buyers",
  },
  {
    title: "A Lightweight Content Engine for High-Intent AI Search Traffic",
    excerpt:
      "Build repeatable briefs, editorial systems, and repurposing loops without turning your brand into generic AI output.",
    publishedAt: "2026-01-18",
    author: "AIeasy Studio",
    category: "Content",
    slug: "content-engine-ai-search-traffic",
  },
] as const;

function createPlaceholder(title: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" fill="none">
      <rect width="1200" height="675" rx="36" fill="#FAFAF8"/>
      <rect x="48" y="48" width="1104" height="579" rx="28" fill="white" stroke="#E5E7EB"/>
      <rect x="92" y="92" width="360" height="220" rx="24" fill="${accent}" fill-opacity="0.12"/>
      <rect x="492" y="96" width="268" height="18" rx="9" fill="#E5E7EB"/>
      <rect x="492" y="136" width="520" height="14" rx="7" fill="#E5E7EB"/>
      <rect x="492" y="164" width="430" height="14" rx="7" fill="#E5E7EB"/>
      <rect x="92" y="356" width="1016" height="1" fill="#E5E7EB"/>
      <rect x="92" y="402" width="180" height="64" rx="24" fill="${accent}" fill-opacity="0.12"/>
      <rect x="298" y="402" width="180" height="64" rx="24" fill="#F3F4F6"/>
      <rect x="504" y="402" width="180" height="64" rx="24" fill="#F3F4F6"/>
      <text x="92" y="556" fill="#1A1A1A" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="600">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main className="pb-24 pt-28">
        <section className="container">
          <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center">
            <AnimatedSection className="space-y-8">
              <Badge className="rounded-full bg-[#0D9488]/10 px-4 py-2 text-sm font-medium text-[#0D9488] hover:bg-[#0D9488]/10">
                Premium AI solutions company in Delhi
              </Badge>
              <div className="space-y-6">
                <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight text-[#1A1A1A] sm:text-6xl">
                  Design, automate, and ship AI experiences with one delivery partner.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[#6B7280]">
                  AIeasy combines strategy, product design, AI automation, and
                  software delivery to help service businesses modernize faster.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  className="h-12 rounded-full bg-[#0D9488] px-6 text-sm font-medium hover:bg-[#14B8A6]"
                >
                  <Link href="/contact">
                    Start a project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Projects launched", value: "50+" },
                  { label: "Avg. workflow lift", value: "37%" },
                  { label: "Delivery speed", value: "2-6 weeks" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.5rem] border border-[#E5E7EB] bg-white p-5"
                  >
                    <p className="text-2xl font-semibold text-[#1A1A1A]">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm text-[#6B7280]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1} direction="left">
              <div className="rounded-[2rem] border border-[#E5E7EB] bg-white p-6 shadow-card">
                <div className="rounded-[1.75rem] bg-[#FAFAF8] p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A1A]">
                        Product + AI execution
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        Strategy, design, automation, engineering
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4">
                    {[
                      "AI-assisted customer journeys",
                      "Custom internal dashboards",
                      "Lead qualification and routing",
                      "Content systems with human review",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.25rem] border border-[#E5E7EB] bg-white px-4 py-4 text-sm text-[#1A1A1A]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <DeployOnSection />

        <Separator className="container my-4 bg-[#E5E7EB]" />

        <section id="services" className="container scroll-mt-28 py-20">
          <AnimatedSection className="mb-10 max-w-2xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
              Services
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
              A modular service stack for AI-led growth.
            </h2>
            <p className="text-lg leading-8 text-[#6B7280]">
              Mix strategy, design, automation, and implementation based on
              your current bottlenecks and timeline.
            </p>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <AnimatedSection key={service.title} delay={index * 0.05}>
                <ServiceCard {...service} />
              </AnimatedSection>
            ))}
          </div>
        </section>

        <section id="testimonials" className="container scroll-mt-28 py-24">
          <AnimatedSection className="mb-10 max-w-2xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
              Testimonials
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
              Results that earn long-term trust.
            </h2>
            <p className="text-lg leading-8 text-[#6B7280]">
              A snapshot of what clients say after shipping automation, websites, dashboards, and AI systems with AIeasy.
            </p>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={`${testimonial.name}-${testimonial.company}`} delay={index * 0.05}>
                <TestimonialCard {...testimonial} />
              </AnimatedSection>
            ))}
          </div>
        </section>

        <section id="blog" className="container scroll-mt-28 py-24">
          <AnimatedSection className="mb-10 max-w-2xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
              Blog
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
              Insight cards for strategy, execution, and AI adoption.
            </h2>
            <p className="text-lg leading-8 text-[#6B7280]">
              Compact article components for editorial grids, featured content,
              and category-driven discovery.
            </p>
          </AnimatedSection>
          <div className="grid gap-6 lg:grid-cols-3">
            {blogPosts.map((post, index) => (
              <AnimatedSection
                key={post.slug}
                delay={index * 0.05}
                direction="up"
              >
                <BlogCard
                  {...post}
                  coverImage={createPlaceholder(post.title, "#14B8A6")}
                />
              </AnimatedSection>
            ))}
          </div>
        </section>

        <section id="contact" className="container scroll-mt-28">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <AnimatedSection className="space-y-6">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
                Contact
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
                A multi-step lead form built for qualification, not friction.
              </h2>
              <p className="text-lg leading-8 text-[#6B7280]">
                Collect richer project context up front so discovery calls start
                with priorities, constraints, and expected outcomes already on
                the table.
              </p>
              <div className="grid gap-4">
                {[
                  "Captures core client details first",
                  "Routes interest into AIeasy service categories",
                  "Qualifies budget, timeline, and project scope",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.25rem] border border-[#E5E7EB] bg-white px-5 py-4 text-sm text-[#1A1A1A]"
                  >
                    {item}
                  </div>
                ))}
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
