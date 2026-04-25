import { Calendar, CheckCircle2, Clock, MessageSquare, Phone } from "lucide-react";

interface SuccessMessageProps {
  name: string;
  calendlyUrl?: string;
}

const nextSteps = [
  {
    icon: Phone,
    title: "We review your requirement",
    text: "Our team looks at your business type, goals and the scope you shared.",
  },
  {
    icon: MessageSquare,
    title: "You get a clear recommendation",
    text: "We suggest the right package, pricing direction and next steps without confusion.",
  },
  {
    icon: Clock,
    title: "Move ahead when ready",
    text: "There is no pressure. You can review the plan and decide only when it feels right.",
  },
] as const;

export function SuccessMessage({
  name,
  calendlyUrl = "https://calendly.com/aieasy/30min",
}: SuccessMessageProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-teal-100 bg-white shadow-[0_30px_80px_rgba(15,148,136,0.16)]">
      <div className="bg-gradient-to-br from-teal-50 via-white to-white px-6 pb-6 pt-7 text-center sm:px-8 sm:pt-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0D9488] text-white shadow-[0_20px_60px_rgba(15,148,136,0.18)]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
          Thank you{name ? `, ${name}` : ""}.
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          Your website consultation request is in. We&apos;ll review your details
          and contact you with the right website plan.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
        <div className="rounded-[1.6rem] border border-teal-100 bg-teal-50/70 p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-[#0D9488]">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">Want faster clarity?</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            You can also book a free consultation call to discuss your website
            requirement right away.
          </p>
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Book on Calendly
          </a>
        </div>

        <div className="grid gap-3">
          {nextSteps.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-[#0D9488]">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
