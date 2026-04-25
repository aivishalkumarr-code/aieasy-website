"use client";

import { useState, type FormEvent } from "react";
import { Building2, CheckCircle2, Loader2, Mail, MessageSquare, Phone, Send, User } from "lucide-react";

import { submitLead } from "../actions/submitLead";
import { SuccessMessage } from "./SuccessMessage";

type FormValues = {
  name: string;
  phone: string;
  businessName: string;
  websiteType: string;
  message: string;
  email: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  phone: "",
  businessName: "",
  websiteType: "",
  message: "",
  email: "",
};

const websiteTypes = [
  { value: "", label: "Select website type" },
  { value: "business", label: "Business Website" },
  { value: "ecommerce", label: "Ecommerce Website" },
  { value: "landing", label: "Landing Page" },
  { value: "redesign", label: "Website Redesign" },
  { value: "not-sure", label: "Not Sure Yet" },
] as const;

const trustChips = [
  "No Upfront Cost",
  "Free Consultation",
  "Fast Quote",
] as const;

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = "Enter your name.";
  }

  if (!values.phone.trim() || values.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!values.businessName.trim() || values.businessName.trim().length < 2) {
    errors.businessName = "Enter your business name.";
  }

  if (!values.websiteType) {
    errors.websiteType = "Select a website type.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
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
      formData.set("phone", values.phone.trim());
      formData.set("businessName", values.businessName.trim());
      formData.set("websiteType", values.websiteType);
      formData.set("message", values.message.trim());
      formData.set("email", values.email.trim());

      const result = await submitLead(formData);

      if (!result.success) {
        setError(result.message || "Something went wrong. Please try again.");
        return;
      }

      setSubmittedName(result.name || values.name.trim());
      setIsSuccess(true);
      setValues(initialValues);
      setErrors({});
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div id="contact" className="scroll-mt-28 lg:sticky lg:top-24">
        <SuccessMessage name={submittedName} />
      </div>
    );
  }

  return (
    <div id="contact" className="scroll-mt-28 lg:sticky lg:top-24">
      {/* Clean Premium Form Card */}
      <div className="overflow-hidden rounded-[1.5rem] border border-[#E5E7EB] bg-white shadow-lg">
        {/* Soft Teal Header */}
        <div className="bg-gradient-to-b from-[#ECFDF5] to-white px-6 pb-4 pt-5 sm:px-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
            Free Website Consultation
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[#111827] sm:text-[1.35rem]">
            Get Your Website Proposal in 60 Seconds
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
            Tell us what you need and we&apos;ll suggest the right website plan, pricing direction and launch timeline.
          </p>

          {/* Clean Trust Chips - Horizontal Row */}
          <div className="mt-4 flex flex-wrap gap-2">
            {trustChips.map((chip) => (
              <div
                key={chip}
                className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#374151] shadow-sm border border-[#E5E7EB]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0D9488]" />
                {chip}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5 sm:px-7">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#111827]">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Your full name"
                className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-3 text-sm text-[#111827] outline-none transition focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
              />
            </div>
            <FieldError message={errors.name} />
          </div>

          {/* Phone - Priority Field for India Market */}
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[#111827]">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-3 text-sm text-[#111827] outline-none transition focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
              />
            </div>
            <FieldError message={errors.phone} />
          </div>

          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-[#111827]">
              Business Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="businessName"
                name="businessName"
                type="text"
                autoComplete="organization"
                value={values.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                placeholder="Your business name"
                className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-3 text-sm text-[#111827] outline-none transition focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
              />
            </div>
            <FieldError message={errors.businessName} />
          </div>

          {/* Website Type Dropdown */}
          <div>
            <label htmlFor="websiteType" className="mb-1.5 block text-sm font-medium text-[#111827]">
              Website Type <span className="text-red-500">*</span>
            </label>
            <select
              id="websiteType"
              name="websiteType"
              value={values.websiteType}
              onChange={(e) => updateField("websiteType", e.target.value)}
              className="h-12 w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
            >
              {websiteTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.websiteType} />
          </div>

          {/* Email - Optional */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#64748B]">
              Email <span className="text-[#9CA3AF]">(optional)</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="you@business.com"
                className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-3 text-sm text-[#111827] outline-none transition focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-[#111827]">
              Tell us about your business
            </label>
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#9CA3AF]" />
              <textarea
                id="message"
                name="message"
                rows={3}
                value={values.message}
                onChange={(e) => updateField("message", e.target.value)}
                placeholder="Tell us what you sell, who you serve, and what kind of website you need."
                className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-3 text-sm text-[#111827] outline-none transition focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0F766E] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Get My Free Website Proposal
              </>
            )}
          </button>

          {/* Microcopy */}
          <p className="text-center text-xs leading-relaxed text-[#6B7280]">
            No spam. No pressure. We&apos;ll contact you with a clear plan.
          </p>
        </form>
      </div>
    </div>
  );
}
