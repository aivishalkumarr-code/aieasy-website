"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SuccessMessageProps {
  email: string;
  phone: string;
  calendlyLink: string;
}

export function SuccessMessage({ email, phone, calendlyLink }: SuccessMessageProps) {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[2rem] border border-[#cde6e1] bg-white px-6 py-10 text-center shadow-sm sm:px-10">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f9f6] text-[#0d9488]">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h3 className="mt-6 text-3xl font-semibold tracking-tight text-[#10231f]">
        Quote request received
      </h3>
      <p className="mt-4 max-w-lg text-lg leading-8 text-[#5f7773]">
        Thank you! We&apos;ve sent a confirmation email to <span className="font-semibold text-[#10231f]">{email}</span>.
      </p>
      <Button
        asChild
        size="lg"
        className="mt-8 h-12 rounded-full bg-[#0d9488] px-8 font-semibold text-white hover:bg-[#0f766e]"
      >
        <Link href={calendlyLink} target="_blank" rel="noreferrer">
          Schedule Your Free Consultation
        </Link>
      </Button>
      <p className="mt-4 text-sm text-[#5f7773]">
        Or we&apos;ll call you within 24 hours at <span className="font-semibold text-[#10231f]">{phone}</span>
      </p>
    </div>
  );
}
