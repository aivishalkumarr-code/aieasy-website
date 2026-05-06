import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, CheckCircle2, Clock3, Mail, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Thank You | AIeasy Website Design",
};

type ThankYouPageProps = {
  searchParams?: Promise<{
    name?: string | string[];
  }>;
};

const nextSteps = [
  {
    icon: Sparkles,
    title: "Custom direction",
    text: "We review your goals and recommend the best package.",
  },
  {
    icon: Clock3,
    title: "Fast turnaround",
    text: "Expect your initial design direction within 48 hours.",
  },
  {
    icon: Mail,
    title: "No chasing required",
    text: "Our team will follow up with your quote.",
  },
] as const;

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams;
  const nameParam = params?.name;
  const submittedName = Array.isArray(nameParam) ? nameParam[0] : nameParam;
  const name = submittedName?.trim() ? submittedName.trim() : "there";

  return (
    <main className="bg-[#F8FAFC] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_24px_70px_rgba(37,99,235,0.16)]">
          <section className="relative overflow-hidden bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] px-6 pb-8 pt-8 text-center text-white sm:px-10 sm:pb-10 sm:pt-10">
            <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-sky-300/20" />
            <div className="relative mx-auto flex max-w-xl flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-white shadow-2xl ring-1 ring-white/30 sm:h-24 sm:w-24">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Thank you, {name}!</h1>
              <p className="mt-3 text-sm leading-6 text-blue-50 sm:text-base">
                Your website consultation request has been received. We&apos;ve sent a confirmation email with
                next steps.
              </p>
            </div>
          </section>

          <section className="space-y-6 px-6 py-7 sm:px-10 sm:py-10">
            <div className="grid gap-3">
              {nextSteps.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#6B7280]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#2563EB]/20 bg-[#EFF6FF] p-5 sm:p-6">
              <div className="flex items-center justify-center gap-2 text-[#1D4ED8]">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-semibold sm:text-base">Book your free strategy call now</span>
              </div>
              <a
                href="https://calendly.com/aieasy/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                Book your free strategy call now
              </a>
              <Link
                href="/lp/website-design"
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-[#2563EB]/25 bg-white px-5 text-sm font-semibold text-[#1D4ED8] transition hover:bg-[#EFF6FF]"
              >
                Back to Website Design
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
