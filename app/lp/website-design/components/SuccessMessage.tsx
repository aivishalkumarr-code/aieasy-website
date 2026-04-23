import { Check, Calendar } from "lucide-react";

interface SuccessMessageProps {
  name: string;
  calendlyUrl?: string;
}

export function SuccessMessage({ name, calendlyUrl = "https://calendly.com/aieasy/30min" }: SuccessMessageProps) {
  return (
    <div className="rounded-2xl border border-[#0D9488]/20 bg-[#0D9488]/5 p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0D9488]">
        <Check className="h-8 w-8 text-white" />
      </div>
      <h3 className="mb-2 text-2xl font-bold text-[#1A1A1A]">
        Thank You, {name}!
      </h3>
      <p className="mb-6 text-[#6B7280]">
        We&apos;ve received your request and will get back to you within 24 hours. 
        A confirmation email has been sent to your inbox.
      </p>
      
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-center gap-2 text-[#0D9488]">
          <Calendar className="h-5 w-5" />
          <span className="font-semibold">Book Your Free Consultation</span>
        </div>
        <p className="mb-4 text-sm text-[#6B7280]">
          Skip the wait! Schedule a 30-minute call with our team right now.
        </p>
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#1A1A1A] px-8 text-base font-semibold text-white transition-all hover:bg-[#333]"
        >
          Book on Calendly
        </a>
      </div>
    </div>
  );
}
