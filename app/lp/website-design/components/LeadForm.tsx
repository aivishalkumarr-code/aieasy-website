"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, User, Building2, Phone, Mail, MessageSquare } from "lucide-react";
import { submitLead } from "../actions/submitLead";
import { SuccessMessage } from "./SuccessMessage";

export function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await submitLead(formData);

      if (result.success) {
        setIsSuccess(true);
        setSubmittedName(result.name || "");
      } else {
        setError(result.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return <SuccessMessage name={submittedName} />;
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-lg sm:p-8"
    >
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="John Doe"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#0D9488] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
            />
          </div>
        </div>

        {/* Business Name Field */}
        <div>
          <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
            Business Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              id="businessName"
              name="businessName"
              placeholder="Your Company Ltd"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#0D9488] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
            />
          </div>
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="+91 98XXX XXXXX"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#0D9488] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#0D9488] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
            />
          </div>
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="mb-2 block text-sm font-medium text-[#1A1A1A]">
            Message <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-[#6B7280]" />
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              placeholder="Tell us about your project requirements..."
              className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#0D9488] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0D9488] text-base font-semibold text-white shadow-lg transition-all hover:bg-[#14B8A6] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Get My Free Quote
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#6B7280]">
          By submitting this form, you agree to our privacy policy and terms of service.
        </p>
      </div>
    </motion.form>
  );
}
