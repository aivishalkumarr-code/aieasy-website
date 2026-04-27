"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Mail,
  Search,
  Users,
} from "lucide-react";

import { signOut } from "@/app/dashboard/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/crm", label: "CRM", icon: BarChart3 },
  { href: "/dashboard/quotes", label: "Quotes", icon: FileText },
  { href: "/dashboard/emails", label: "Emails", icon: Mail },
  { href: "/dashboard/seo", label: "SEO Tools", icon: Search },
  { href: "/dashboard/partners", label: "Partners", icon: Globe },
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col rounded-[2rem] border border-[#DDE7E3] bg-white p-5 shadow-card",
        className,
      )}
    >
      <div>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-[#EFF6FF] ring-1 ring-[#2563EB]/10">
            <Image
              src="/logo.png"
              alt="aicosy"
              width={220}
              height={56}
              className="absolute left-1 top-1/2 h-8 w-[154px] max-w-none -translate-y-1/2 object-contain object-left"
              sizes="44px"
              priority
            />
          </div>
          <div className="relative h-12 min-w-0 flex-1">
            <Image
              src="/logo.png"
              alt="aicosy | AI Made Easy"
              fill
              className="object-contain object-left"
              sizes="180px"
              priority
            />
          </div>
        </Link>

        <nav className="mt-8 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#4B5563] hover:bg-[#F4F6F2] hover:text-[#1A1A1A]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto rounded-[1.5rem] bg-[#F4F6F2] p-4">
        <p className="text-sm font-medium text-[#1A1A1A]">Protected workspace</p>
        <p className="mt-1 text-sm leading-6 text-[#6B7280]">
          Secured by Supabase, emails via Resend.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleSignOut}
          className="mt-4 h-11 w-full rounded-xl border-[#DDE7E3] bg-white text-[#1A1A1A] hover:bg-[#FAFAF8]"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
