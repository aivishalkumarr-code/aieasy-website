import Image from "next/image";
import { Star } from "lucide-react";

import { AnimatedSection } from "./AnimatedSection";

const testimonials = [
  {
    name: "Rajesh Malhotra",
    business: "Delhi Retailer",
    quote: "Our website went live and we got 12 leads in the first week. It finally feels like our website is working for the business.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Priya Sharma",
    business: "Boutique Owner",
    quote: "Best investment for our business. Sales increased 35% in 2 months and customers constantly compliment the site.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Amit Verma",
    business: "Real Estate Consultant",
    quote: "The site looks premium, loads fast, and helps us qualify serious inquiries. We saw better leads almost immediately.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Neha Kapoor",
    business: "Wellness Clinic Founder",
    quote: "We needed something professional and trustworthy. Bookings increased and mobile visitors finally started converting.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sandeep Arora",
    business: "Home Services Company",
    quote: "AIeasy turned our basic site into a real lead engine. We now have a website we can confidently run ads to.",
    image:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80",
  },
] as const;

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-white py-20 sm:py-24">
      <div className="container">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0D9488]">
            Social proof
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-[#1A1A1A] sm:text-4xl">
            Business owners are already seeing the difference.
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#6B7280]">
            Placeholder testimonials for now, but the message is clear: a strong website changes how customers perceive and respond to your business.
          </p>
        </AnimatedSection>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={testimonial.name} delay={index * 0.05}>
              <article className="flex h-full flex-col rounded-[1.8rem] border border-[#E5E7EB] bg-[#fafaf8] p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white shadow-sm">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">{testimonial.name}</p>
                    <p className="text-sm text-[#6B7280]">{testimonial.business}</p>
                  </div>
                </div>

                <div className="mt-5 flex gap-1 text-[#f59e0b]">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <p className="mt-5 flex-1 text-sm leading-7 text-[#4B5563]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
