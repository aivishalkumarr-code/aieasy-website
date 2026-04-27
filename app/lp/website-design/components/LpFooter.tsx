import Link from "next/link";
import { Mail } from "lucide-react";

export function LpFooter() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 py-8 text-sm text-[#64748B] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-lg font-bold tracking-tight text-[#0F172A]">Aleasy / AIeasy</p>
          <p className="mt-1 max-w-md leading-6">
            Professional website design for Delhi businesses that want a clean online presence and more enquiries.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <a href="mailto:hello@aieasy.in" className="inline-flex items-center gap-2 transition hover:text-[#2563EB]">
            <Mail className="h-4 w-4" />
            hello@aieasy.in
          </a>
          <Link href="/" className="transition hover:text-[#2563EB]">
            Back to AIeasy main site
          </Link>
        </div>
      </div>
    </footer>
  );
}
