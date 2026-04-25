"use client";

import { useState, type FormEvent } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { submitLead } from "../actions/submitLead";
import { primaryButtonClass } from "./LandingPrimitives";
import {
  formTrustChips,
  websiteTypeOptions,
} from "./landingPageContent";
import { SuccessMessage } from "./SuccessMessage";

type FormValues = {
  name: string;
  phone: string;
  businessName: string;
  websiteType: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  phone: "",
  businessName: "",
  websiteType: "",
  message: "",
};

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

  if (!values.phone.trim()) {
    errors.phone = "Enter your phone number.";
  } else if (phoneDigits.length < 10) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!values.businessName.trim()) {
    errors.businessName = "Enter your business name.";
  } else if (values.businessName.trim().length < 2) {
    errors.businessName = "Business name should be at least 2 characters.";
  }

  if (!values.websiteType.trim()) {
    errors.websiteType = "Select the website type you need.";
  }

  if (values.message.trim() && values.message.trim().length < 12) {
    errors.message = "Add a little more detail or leave this blank.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm font-medium text-rose-600">{message}</p>;
}

function fieldClasses(hasError?: boolean) {
  return [
    "h-12 rounded-2xl border bg-white pl-11 text-[15px] text-slate-900 placeholder:text-slate-400 focus-visible:border-[#0D9488] focus-visible:ring-4 focus-visible:ring-[#0D9488]/10 focus-visible:ring-offset-0",
    hasError ? "border-rose-300" : "border-slate-200/80",
  ].join(" ");
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
      website_type: values.websiteType,
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
      formData.set("phone", values.phone.trim());
      formData.set("businessName", values.businessName.trim());
      formData.set("websiteType", values.websiteType.trim());
      formData.set("message", values.message.trim());

      const result = await submitLead(formData);

      if (!result.success) {
        setError(result.message || "Something went wrong. Please try again.");
        return;
      }

      setSubmittedName(result.name || values.name.trim());
      setValues(initialValues);
      setErrors({});
      setIsSuccess(true);
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
      <div
        className="overflow-hidden rounded-[28px] border border-teal-100 bg-white shadow-[0_30px_80px_rgba(15,148,136,0.16)]"
      >
        <div className="bg-gradient-to-br from-teal-50 via-white to-white px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
            Free website consultation
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
            Get Your Website Proposal in 60 Seconds
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Tell us what you need and we&apos;ll suggest the right website plan,
            pricing direction and launch timeline.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {formTrustChips.map((chip) => (
              <div
                key={chip}
                className="inline-flex items-center rounded-full border border-teal-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm"
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-teal-600" />
                {chip}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6 sm:px-8 sm:py-8">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-900">
                Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={values.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Your full name"
                  className={fieldClasses(Boolean(errors.name))}
                />
              </div>
              <FieldError message={errors.name} />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-900">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className={fieldClasses(Boolean(errors.phone))}
                />
              </div>
              <FieldError message={errors.phone} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-slate-900">
                Business Name
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="businessName"
                  name="businessName"
                  autoComplete="organization"
                  value={values.businessName}
                  onChange={(event) => updateField("businessName", event.target.value)}
                  placeholder="Your business name"
                  className={fieldClasses(Boolean(errors.businessName))}
                />
              </div>
              <FieldError message={errors.businessName} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Website Type
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Select
                  value={values.websiteType || undefined}
                  onValueChange={(value) => updateField("websiteType", value)}
                >
                  <SelectTrigger className={fieldClasses(Boolean(errors.websiteType))}>
                    <SelectValue placeholder="Select website type" />
                  </SelectTrigger>
                  <SelectContent>
                    {websiteTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FieldError message={errors.websiteType} />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-900">
              Message
            </label>
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Textarea
                id="message"
                name="message"
                rows={4}
                value={values.message}
                onChange={(event) => updateField("message", event.target.value)}
                placeholder="Tell us what you need, what your business does, or what kind of website you want."
                className={`min-h-[120px] resize-none rounded-2xl border bg-white pl-11 text-[15px] text-slate-900 placeholder:text-slate-400 focus-visible:border-[#0D9488] focus-visible:ring-4 focus-visible:ring-[#0D9488]/10 focus-visible:ring-offset-0 ${errors.message ? "border-rose-300" : "border-slate-200/80"}`}
              />
            </div>
            <FieldError message={errors.message} />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={`${primaryButtonClass} h-12 w-full text-base disabled:pointer-events-none disabled:opacity-70`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending your request...
              </>
            ) : (
              "Get My Free Website Proposal"
            )}
          </Button>

          <p className="text-center text-xs leading-5 text-slate-500">
            No spam. No pressure. We&apos;ll contact you with a clear plan.
          </p>
        </form>
      </div>
    </div>
  );
}
