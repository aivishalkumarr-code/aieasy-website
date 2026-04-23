import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

import { FEATURED_SERVICE_SLUGS, getServicePage } from "@/app/services/service-data";

const companyLinks = [
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Blog", href: "/#blog" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/contact" },
] as const;

const socialLinks = [
  { label: "X", href: "https://x.com/aieasy", icon: Twitter },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/aieasy", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/aieasy", icon: Github },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 bg-[#1A1A1A] text-white">
      <div className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-5 lg:col-span-1">
            <div>
              <Link href="/" className="text-2xl font-semibold tracking-tight text-white">
                AIeasy
              </Link>
              <p className="mt-3 text-sm font-medium uppercase tracking-[0.24em] text-[#5EEAD4]">
                Premium AI delivery partner
              </p>
            </div>
            <p className="max-w-md text-sm leading-7 text-gray-400">
              Premium AI solutions company based in Delhi, India. We design, automate, and ship practical AI systems for ambitious service businesses.
            </p>
            <p className="text-sm leading-7 text-gray-400">Delhi, India</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Services</p>
            <ul className="mt-5 space-y-3 text-sm text-gray-400">
              {FEATURED_SERVICE_SLUGS.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/services/${slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {getServicePage(slug)?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Company</p>
            <ul className="mt-5 space-y-3 text-sm text-gray-400">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Social</p>
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-[#0D9488] hover:bg-[#0D9488] hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AIeasy Solutions Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
