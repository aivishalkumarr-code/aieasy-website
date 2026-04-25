import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";

import { AnimatedSection } from "@/app/components/AnimatedSection";
import { Footer } from "@/app/components/Footer";
import { LeadForm } from "@/app/components/LeadForm";
import { Navigation } from "@/app/components/Navigation";
import { serviceIconMap } from "@/app/services/icon-map";
import { getServicePage, SERVICE_PAGE_ORDER } from "@/app/services/service-data";
import { Button } from "@/components/ui/button";

const siteUrl = "https://aieasy.in";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SERVICE_PAGE_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServicePage(slug);

  if (!service) {
    return {};
  }

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: `/services/${slug}`,
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServicePage(slug);

  if (!service) {
    notFound();
  }

  const ServiceIcon = serviceIconMap[service.iconName];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.metaDescription,
    serviceType: service.name,
    url: `${siteUrl}/services/${service.slug}`,
    areaServed: "Worldwide",
    provider: {
      "@type": "Organization",
      name: "AIeasy Solutions Pvt Ltd",
      url: siteUrl,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Delhi",
        addressCountry: "IN",
      },
    },
  };

  return (
    <>
      <Navigation />
      <main className="pb-24 pt-28">
        <section className="container">
          <AnimatedSection className="rounded-[2rem] border border-[#E5E7EB] bg-white p-8 shadow-card lg:p-12">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#6B7280]">
              <Link href="/" className="transition-colors hover:text-[#1A1A1A]">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-[#1A1A1A]">{service.name}</span>
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
              <div className="space-y-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                  <ServiceIcon className="h-7 w-7" />
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
                    Service
                  </p>
                  <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight text-[#1A1A1A] sm:text-6xl">
                    {service.name}
                  </h1>
                  <p className="max-w-3xl text-xl leading-8 text-[#1A1A1A]">
                    {service.tagline}
                  </p>
                  <p className="max-w-3xl text-lg leading-8 text-[#6B7280]">
                    {service.description}
                  </p>
                </div>
                <Button
                  asChild
                  className="h-12 rounded-full bg-[#0D9488] px-6 text-sm font-medium hover:bg-[#14B8A6]"
                >
                  <a href="#service-form">
                    Start a project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="rounded-[1.75rem] border border-[#E5E7EB] bg-[#FAFAF8] p-6">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#0D9488]">
                  Outcomes
                </p>
                <div className="mt-5 space-y-4">
                  {service.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-[1.25rem] border border-[#E5E7EB] bg-white p-4">
                      <p className="text-3xl font-semibold tracking-tight text-[#1A1A1A]">
                        {metric.value}
                      </p>
                      <p className="mt-2 font-medium text-[#1A1A1A]">{metric.label}</p>
                      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{metric.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </section>

        <section className="container py-24">
          <AnimatedSection className="mb-10 max-w-2xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
              Benefits
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
              Why teams choose {service.name.toLowerCase()} from AIeasy.
            </h2>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {service.benefits.map((benefit, index) => {
              const BenefitIcon = serviceIconMap[benefit.iconName];

              return (
                <AnimatedSection key={benefit.title} delay={index * 0.05}>
                  <div className="h-full rounded-[1.5rem] border border-[#E5E7EB] bg-white p-7 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                      <BenefitIcon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-[#1A1A1A]">{benefit.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#6B7280]">{benefit.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </section>

        <section className="container pb-24">
          <AnimatedSection className="mb-10 max-w-2xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
              How it works
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
              A clear delivery process from strategy to launch.
            </h2>
          </AnimatedSection>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {service.steps.map((step, index) => (
              <AnimatedSection key={step} delay={index * 0.05}>
                <div className="h-full rounded-[1.5rem] border border-[#E5E7EB] bg-white p-7 shadow-sm">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#0D9488]">
                    Step {index + 1}
                  </p>
                  <p className="mt-4 text-base leading-7 text-[#1A1A1A]">{step}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        <section className="container pb-24">
          <AnimatedSection className="mb-10 max-w-2xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
              Results
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
              Example outcomes we optimize for.
            </h2>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {service.metrics.map((metric, index) => (
              <AnimatedSection key={`${metric.value}-${metric.label}`} delay={index * 0.05}>
                <div className="h-full rounded-[1.5rem] border border-[#E5E7EB] bg-[#FAFAF8] p-7">
                  <p className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
                    {metric.value}
                  </p>
                  <p className="mt-3 text-lg font-medium text-[#1A1A1A]">{metric.label}</p>
                  <p className="mt-3 text-sm leading-7 text-[#6B7280]">{metric.context}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        <section id="service-form" className="container scroll-mt-28">
          <div className="grid gap-12 rounded-[2rem] border border-[#E5E7EB] bg-white p-8 shadow-card lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:p-10">
            <AnimatedSection className="space-y-6">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#0D9488]">
                Start the conversation
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
                Get a tailored {service.name.toLowerCase()} plan.
              </h2>
              <p className="text-lg leading-8 text-[#6B7280]">
                Share your current workflow, goals, and delivery timeline. We&apos;ll recommend the right scope, rollout approach, and next steps.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.1} direction="left">
              <LeadForm />
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
