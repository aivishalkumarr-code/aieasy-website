"use client";

import { useState, type FormEvent } from "react";
import {
  Building2,
  CheckCircle2,
  Globe2,
  Loader2,
  Mail,
  Send,
  User,
} from "lucide-react";

import { submitLead } from "../actions/submitLead";
import { SuccessMessage } from "./SuccessMessage";

type FormValues = {
  name: string;
  businessName: string;
  websiteType: string;
  email: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  businessName: "",
  websiteType: "",
  email: "",
};

const websiteTypes = [
  { value: "", label: "Select website type" },
  { value: "Business Website", label: "Business Website" },
  { value: "Ecommerce Website", label: "Ecommerce Website" },
  { value: "Landing Page", label: "Landing Page" },
  { value: "Website Redesign", label: "Website Redesign" },
  { value: "Not Sure Yet", label: "Not Sure Yet" },
] as const;

const trustChips = ["No Upfront Cost", "Free Consultation", "Fast Quote"] as const;

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = "Enter your name.";
  }

  if (!values.businessName.trim() || values.businessName.trim().length < 2) {
    errors.businessName = "Enter your business name.";
  }

  if (!values.websiteType) {
    errors.websiteType = "Select a website type.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-base text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20";

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
      formData.set("businessName", values.businessName.trim());
      formData.set("websiteType", values.websiteType);
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
      <div id="contact" className="scroll-mt-28">
        <SuccessMessage name={submittedName} />
      </div>
    );
  }

  return (
    <div id="contact" className="scroll-mt-28">
      <div className="w-full max-w-[560px] overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_24px_70px_rgba(37,99,235,0.14)]">
        <div className="bg-gradient-to-br from-blue-50 via-white to-white px-5 pb-5 pt-6 sm:px-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
            FREE WEBSITE CONSULTATION
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0F172A]">
            Get Your Website Proposal in 60 Seconds
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
            Tell us what you need and we&apos;ll suggest the right website plan, pricing direction and launch timeline.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 max-[380px]:hidden">
            {trustChips.map((chip) => (
              <div
                key={chip}
                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-sm text-slate-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB]" />
                {chip}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-7 sm:px-7">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>
            <FieldError message={errors.name} />
          </div>

          <div>
            <label htmlFor="businessName" className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
              Business Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="businessName"
                name="businessName"
                type="text"
                autoComplete="organization"
                value={values.businessName}
                onChange={(event) => updateField("businessName", event.target.value)}
                placeholder="Your business name"
                className={inputClass}
              />
            </div>
            <FieldError message={errors.businessName} />
          </div>

          <div>
            <label htmlFor="websiteType" className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
              Website Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                id="websiteType"
                name="websiteType"
                value={values.websiteType}
                onChange={(event) => updateField("websiteType", event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-base text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")',
                  backgroundPosition: "right 0.75rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1rem",
                }}
              >
                {websiteTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <FieldError message={errors.websiteType} />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@business.com"
                className={inputClass}
              />
            </div>
            <FieldError message={errors.email} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2563EB] px-5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-70"
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

          <p className="text-center text-xs leading-relaxed text-[#64748B]">
            No spam. No pressure. We&apos;ll contact you with a clear plan.
          </p>
        </form>
      </div>
    </div>
  );
}
