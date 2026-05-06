"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Loader2, Phone, User, X } from "lucide-react";

import { submitBusinessTypeLead } from "../actions/submitLead";

type FormValues = {
  name: string;
  phone: string;
  email: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

type BusinessTypePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  businessType: string;
};

type BusinessTypeCard = {
  businessType: string;
  title: string;
  description: string;
  cta: string;
  image: string;
};

type BusinessTypeCardsGridProps = {
  cards: readonly BusinessTypeCard[];
};

const initialValues: FormValues = {
  name: "",
  phone: "",
  email: "",
};

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20";

export function BusinessTypePopup({ isOpen, onClose, businessType }: BusinessTypePopupProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setValues(initialValues);
      setErrors({});
      setErrorMessage(null);
      setIsSubmitting(false);
      setIsSuccess(false);
      return;
    }

    const body = document.body;
    const originalOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onClose();
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [isSuccess, onClose]);

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!values.name.trim() || values.name.trim().length < 2) {
      nextErrors.name = "Please enter your full name.";
    }

    if (!values.phone.trim() || values.phone.trim().length < 7) {
      nextErrors.phone = "Please enter a valid mobile/phone number.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("name", values.name.trim());
      formData.set("phone", values.phone.trim());
      formData.set("email", values.email.trim().toLowerCase());
      formData.set("businessType", businessType);

      const result = await submitBusinessTypeLead(formData);

      if (!result.success) {
        setErrorMessage(result.message || "Unable to submit right now. Please try again.");
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage("Unable to submit right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
        </button>

        {!isSuccess ? (
          <>
            <h3 className="pr-8 text-2xl font-bold tracking-tight text-[#0F172A]">
              Get a Free Website Plan for {businessType}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              Tell us about yourself and we&apos;ll suggest the right website package.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="popup-name" className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="popup-name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="Your full name"
                  />
                </div>
                {errors.name ? <p className="mt-1 text-xs font-medium text-red-600">{errors.name}</p> : null}
              </div>

              <div>
                <label htmlFor="popup-phone" className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
                  Mobile/Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="popup-phone"
                    type="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="+91 98765 43210"
                  />
                </div>
                {errors.phone ? <p className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p> : null}
              </div>

              <div>
                <label htmlFor="popup-email" className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="popup-email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={inputClass}
                  placeholder="you@business.com"
                />
                {errors.email ? <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p> : null}
              </div>

              <div>
                <label htmlFor="popup-business-type" className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
                  Business Type
                </label>
                <input
                  id="popup-business-type"
                  type="text"
                  value={businessType}
                  readOnly
                  className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-600`}
                />
              </div>

              {errorMessage ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Get Free Website Plan"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="py-4">
            <h3 className="text-xl font-bold text-[#0F172A]">Thank you!</h3>
            <p className="mt-3 text-sm leading-6 text-[#475569]">
              Thank you! We&apos;ll contact you within 24 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function BusinessTypeCardsGrid({ cards }: BusinessTypeCardsGridProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [businessType, setBusinessType] = useState("");

  const handleOpen = (title: string) => {
    setBusinessType(title);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setBusinessType("");
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.businessType}
            type="button"
            onClick={() => handleOpen(card.title)}
            className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="aspect-[3/2] overflow-hidden bg-slate-100">
              <img
                src={card.image}
                alt={card.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-xl font-bold text-[#0F172A]">{card.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-[#475569]">{card.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold text-[#2563EB] transition-all group-hover:gap-3 group-hover:text-[#1D4ED8]">
                Get Free Website Plan <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <BusinessTypePopup isOpen={isOpen} onClose={handleClose} businessType={businessType} />
    </>
  );
}
