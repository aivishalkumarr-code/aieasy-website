import { ExternalLink } from "lucide-react";

import { getPartners } from "@/app/dashboard/actions/partners";
import { AnimatedSection } from "@/app/components/AnimatedSection";

export async function DeployOnSection() {
  const partners = await getPartners();

  return (
    <section className="container py-24">
      <AnimatedSection className="mx-auto max-w-3xl space-y-4 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#2563EB]">
          Trusted Deployment Platforms
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-[#1A1A1A]">
          Trusted Deployment Platforms
        </h2>
        <p className="text-lg leading-8 text-[#6B7280]">
          We deploy and scale across the world&apos;s leading cloud infrastructure.
        </p>
      </AnimatedSection>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {partners.map((partner, index) => {
          const card = (
            <div className="group flex h-full min-h-32 flex-col justify-center rounded-[1.5rem] border border-[#E5E7EB] bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
              <div className="flex min-h-12 items-center justify-center">
                <img
                  src={partner.image_url}
                  alt={partner.name}
                  width={160}
                  height={56}
                  className="h-10 w-auto max-w-[140px] object-contain grayscale transition duration-300 group-hover:grayscale-0"
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-[#6B7280] transition-colors group-hover:text-[#1A1A1A]">
                <span>{partner.name}</span>
                {partner.url ? <ExternalLink className="h-3.5 w-3.5" /> : null}
              </div>
            </div>
          );

          return (
            <AnimatedSection key={partner.id} delay={index * 0.05}>
              {partner.url ? (
                <a href={partner.url} target="_blank" rel="noreferrer" className="block h-full">
                  {card}
                </a>
              ) : (
                card
              )}
            </AnimatedSection>
          );
        })}
      </div>
    </section>
  );
}
