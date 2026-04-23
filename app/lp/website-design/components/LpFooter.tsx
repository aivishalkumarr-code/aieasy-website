import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export function LpFooter() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Company Info */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D9488] text-white font-bold">
                A
              </div>
              <span className="text-xl font-bold text-[#1A1A1A]">AIeasy</span>
            </div>
            <p className="mb-4 text-sm text-[#6B7280]">
              Premium AI solutions company based in Delhi, India. We help businesses add AI to their operations.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#1A1A1A]">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Phone className="h-4 w-4 text-[#0D9488]" />
                +91 98XXX XXXXX
              </li>
              <li className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Mail className="h-4 w-4 text-[#0D9488]" />
                hello@aieasy.in
              </li>
              <li className="flex items-start gap-2 text-sm text-[#6B7280]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0D9488]" />
                Delhi, India
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#1A1A1A]">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#benefits" className="text-sm text-[#6B7280] hover:text-[#0D9488]">
                  Benefits
                </a>
              </li>
              <li>
                <a href="#portfolio" className="text-sm text-[#6B7280] hover:text-[#0D9488]">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-[#6B7280] hover:text-[#0D9488]">
                  Pricing
                </a>
              </li>
              <li>
                <Link href="/" className="text-sm text-[#6B7280] hover:text-[#0D9488]">
                  Main Website
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#E5E7EB] pt-8 text-center">
          <p className="text-sm text-[#6B7280]">
            &copy; {new Date().getFullYear()} AIeasy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
