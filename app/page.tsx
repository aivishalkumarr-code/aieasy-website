import {
  ArrowRight,
  Code,
  Cpu,
  FileText,
  Globe,
  Phone,
  Palette,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { AIDemoChat } from "@/app/components/AIDemoChat";
import { AnimatedSection } from "@/app/components/AnimatedSection";
import { BlogCard } from "@/app/components/BlogCard";
import { CaseStudyCard } from "@/app/components/CaseStudyCard";
import { LeadForm } from "@/app/components/LeadForm";
import { Navigation } from "@/app/components/Navigation";
import { ServiceCard } from "@/app/components/ServiceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const services = [
  {
    icon: Cpu,
    title: "AI Automation",
    description:
      "Replace repetitive manual operations with AI workflows that move data, triage requests, and trigger actions automatically.",
    href: "#contact",
  },
  {
    icon: Globe,
    title: "AI Web Apps",
    description:
      "Launch productized AI experiences with custom dashboards, model orchestration, secure auth, and analytics-ready interfaces.",
    href: "#demo",
  },
  {
    icon: Palette,
    title: "Website Design",
    description:
      "Design premium conversion-focused websites with clear messaging, lightweight interactions, and polished responsive systems.",
    href: "#blog",
  },
  {
    icon: TrendingUp,
    title: "AI Marketing",
    description:
      "Connect campaign strategy, performance tracking, and AI-assisted execution to drive more qualified pipeline.",
    href: "#contact",
  },
  {
    icon: FileText,
    title: "AI Content",
    description:
      "Build repeatable content engines for thought leadership, SEO pages, sales collateral, and multi-channel repurposing.",
    href: "#blog",
  },
  {
    icon: Code,
    title: "Software Dev",
    description:
      "Ship full-stack systems that blend product design, application engineering, AI integrations, and maintainable architecture.",
    href: "#case-studies",
  },
  {
    icon: Phone,
    title: "IVR Setup",
    description:
      "Deploy AI-assisted voice systems for qualification, routing, support triage, and appointment capture across channels.",
    href: "#contact",
  },
] as const;

const caseStudies = [
  {
    title: "Lead Qualification Copilot for a Consulting Firm",
    category: "AI Automation",
    description:
      "Built a lead intake workflow that scored inbound requests, enriched company data, and delivered instant follow-up recommendations.",
    results: ["62% faster response", "3.1x more qualified leads", "12 hrs saved/week"],
    slug: "lead-qualification-copilot",
  },
  {
    title: "Growth Website for an AI SaaS Product",
    category: "Website Design",
    description:
      "Redesigned the marketing site with clearer positioning, modular CMS sections, and a stronger conversion path for enterprise demos.",
    results: ["41% more demo requests", "34% lower bounce", "Core Web Vitals pass"],
    slug: "growth-website-ai-saas",
  },
  {
    title: "Operations Dashboard for Multi-Location Support",
    category: "AI Web Apps",
    description:
      "Created a central dashboard for teams to review support trends, automate escalations, and summarize outcomes with AI.",
    results: ["2.4x faster triage", "Unified reporting", "Lower manual workload"],
    slug: "operations-dashboard-support",
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
                Premium AI solutions company in India
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
                  <a href="#contact">
                    Start a project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-[#E5E7EB] bg-white px-6 text-sm font-medium text-[#1A1A1A]"
                >
                  <a href="#demo">Explore the AI demo</a>
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

        <Separator className="container my-20 bg-[#E5E7EB]" />

        <section id="services" className="container scroll-mt-28">
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

        <section id="demo" className="container scroll-mt-28 py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
            <AnimatedSection className="space-y-6">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
                Demo
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
                Let prospects experience your AI value before the first call.
              </h2>
              <p className="text-lg leading-8 text-[#6B7280]">
                Use simulated assistants, embedded qualification, and curated
                prompts to turn a static website into an interactive buying
                experience.
              </p>
              <div className="grid gap-4">
                {[
                  "Keyword-based response simulation for fast demos",
                  "Reusable chat shell for product showcases",
                  "Connected forms and CTAs for lead capture",
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
              <AIDemoChat />
            </AnimatedSection>
          </div>
        </section>

        <section id="case-studies" className="container scroll-mt-28">
          <AnimatedSection className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
                Case Studies
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
                Selected work across product, automation, and growth.
              </h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-[#6B7280]">
              Reusable case study cards highlight context, impact, and the
              services behind each engagement.
            </p>
          </AnimatedSection>
          <div className="grid gap-6 lg:grid-cols-3">
            {caseStudies.map((caseStudy, index) => (
              <AnimatedSection
                key={caseStudy.slug}
                delay={index * 0.05}
                direction="up"
              >
                <CaseStudyCard
                  {...caseStudy}
                  imageUrl={createPlaceholder(caseStudy.title, "#0D9488")}
                />
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
    </>
  );
}
