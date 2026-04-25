"use client";

import { useState, type FormEvent } from "react";
import { Building2, Loader2, Mail, MessageSquare, Phone, Send, User } from "lucide-react";

import { submitLead } from "../actions/submitLead";
import { SuccessMessage } from "./SuccessMessage";

type FormValues = {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  businessName: "",
  phone: "",
  email: "",
  message: "",
};

const benefits = [
  "Free Consultation Worth ₹2,000",
  "Custom Design Mockup in 48 Hours",
  "No Obligation Quote",
  "7-14 Day Delivery Guarantee",
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: { push: (data: Record<string, unknown>) => number };
  }
}

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  const phoneDigits = values.phone.replace(/\D/g, "");

  if (!values.name.trim()) {
    errors.name = "Enter your name.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name should be at least 2 characters.";
  }

  if (!values.businessName.trim()) {
    errors.businessName = "Enter your business name.";
  } else if (values.businessName.trim().length < 2) {
    errors.businessName = "Business name should be at least 2 characters.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Enter your phone number.";
  } else if (phoneDigits.length < 10) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (values.message.trim() && values.message.trim().length < 12) {
    errors.message = "Add a few more details or leave this field blank.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs font-medium text-red-600">{message}</p>;
}

export function LeadForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const trackLead = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.gtag?.("event", "generate_lead", {
      event_category: "landing_page",
      event_label: "Landing Page - Website Design",
      value: 9999,
      currency: "INR",
    });

    window.dataLayer?.push({
      event: "generate_lead",
      lead_source: "Landing Page - Website Design",
      lead_type: "website_design",
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("name", values.name.trim());
      formData.set("businessName", values.businessName.trim());
      formData.set("phone", values.phone.trim());
      formData.set("email", values.email.trim());
      formData.set("message", values.message.trim());

      const result = await submitLead(formData);

      if (!result.success) {
        setError(result.message || "Something went wrong. Please try again.");
        return;
      }

      setSubmittedName(result.name || values.name.trim());
      setIsSuccess(true);
      setValues(initialValues);
      setErrors({});
      trackLead();
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div id="contact" className="scroll-mt-28 lg:sticky lg:top-28">
        <SuccessMessage name={submittedName} />
      </div>
    );
  }

  return (
    <div id="contact" className="scroll-mt-28 lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-[2rem] border border-[#0D9488]/15 bg-white shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
        <div className="bg-[linear-gradient(180deg,rgba(13,148,136,0.1),rgba(13,148,136,0.04))] px-6 pb-5 pt-6 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0D9488]">
            Free website consultation
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-[2rem]">
            Get My Website Proposal in 60 Seconds
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#4B5563] sm:text-base">
            Share a few details and we&apos;ll send you a tailored recommendation, pricing direction, and the fastest path to launch.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium text-[#1A1A1A] shadow-sm">
                <span className="text-[#0D9488]">✓</span> {benefit}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Your full name"
                className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-sm text-[#1A1A1A] outline-none transition focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10"
              />
            </div>
            <FieldError message={errors.name} />
          </div>

          <div>
            <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              Business Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
              <input
                id="businessName"
                name="businessName"
                type="text"
                autoComplete="organization"
                value={values.businessName}
                onChange={(event) => updateField("businessName", event.target.value)}
                placeholder="Your business name"
                className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-sm text-[#1A1A1A] outline-none transition focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10"
              />
            </div>
            <FieldError message={errors.businessName} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-sm text-[#1A1A1A] outline-none transition focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10"
                />
              </div>
              <FieldError message={errors.phone} />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@business.com"
                  className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-sm text-[#1A1A1A] outline-none transition focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10"
                />
              </div>
              <FieldError message={errors.email} />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              What is your business about?
            </label>
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-[#6B7280]" />
              <textarea
                id="message"
                name="message"
                rows={4}
                value={values.message}
                onChange={(event) => updateField("message", event.target.value)}
                placeholder="Tell us what you sell, who you serve, or what kind of website you need."
                className="w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-sm text-[#1A1A1A] outline-none transition focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10"
              />
            </div>
            <FieldError message={errors.message} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0D9488] px-6 text-base font-semibold text-white shadow-[0_20px_50px_-24px_rgba(13,148,136,0.85)] transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending your request...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Get My Website Proposal in 60 Seconds
              </>
            )}
          </button>

          <p className="text-center text-xs leading-5 text-[#6B7280]">
            No spam. No pressure. Just a clear quote, a smart plan, and a fast next step for your business.
          </p>
        </form>
      </div>
    </div>
  );
}
