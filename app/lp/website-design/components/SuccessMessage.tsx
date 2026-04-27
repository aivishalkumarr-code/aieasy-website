import { Calendar, CheckCircle2, Clock3, Mail, Sparkles } from "lucide-react";

interface SuccessMessageProps {
  name: string;
  calendlyUrl?: string;
}

export function SuccessMessage({
  name,
  calendlyUrl = "https://calendly.com/aieasy/30min",
}: SuccessMessageProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#2563EB]/15 bg-white shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
      <div className="bg-[linear-gradient(180deg,rgba(13,148,136,0.12),rgba(13,148,136,0.04))] px-6 pb-6 pt-7 text-center sm:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-[2rem]">
          Thank you{name ? `, ${name}` : ""}.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#4B5563] sm:text-base">
          Your website growth request is in. We&apos;ve also sent a confirmation email with the next steps and your Calendly link.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
        <div className="rounded-[1.6rem] border border-[#2563EB]/15 bg-[#f0fdfa] p-5">
          <div className="flex items-center justify-center gap-2 text-[#2563EB]">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">Book your free strategy call now</span>
          </div>
          <p className="mt-3 text-center text-sm leading-6 text-[#4B5563]">
            Want faster clarity? Pick a 30-minute slot and we&apos;ll discuss your website, goals, and launch plan immediately.
          </p>
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1A1A1A] px-6 text-sm font-semibold text-white transition hover:bg-[#0f172a]"
          >
            Book on Calendly
          </a>
        </div>

        <div className="grid gap-3">
          {[
            { icon: Sparkles, title: "Custom direction", text: "We review your goals and recommend the best package for growth." },
            { icon: Clock3, title: "Fast turnaround", text: "Expect your initial design direction within 48 hours after kickoff." },
            { icon: Mail, title: "No chasing required", text: "Our team will follow up with your quote and recommended next step." },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
