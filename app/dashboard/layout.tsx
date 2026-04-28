import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getMainLogoUrl } from "@/app/dashboard/actions/logo";
import { DashboardHeader } from "@/app/dashboard/components/DashboardHeader";
import { DashboardSidebar } from "@/app/dashboard/components/DashboardSidebar";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userEmail = "demo@aieasy.io";
  const logoUrl = await getMainLogoUrl();

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    if (!data.user) {
      redirect("/login");
    }

    userEmail = data.user.email ?? userEmail;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] gap-4 lg:min-h-[calc(100vh-2rem)]">
        <div className="hidden w-72 shrink-0 lg:block">
          <DashboardSidebar className="sticky top-4 h-[calc(100vh-2rem)]" logoUrl={logoUrl} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <DashboardHeader userEmail={userEmail} logoUrl={logoUrl} />
          <main className="flex-1">
            <Suspense fallback={null}>{children}</Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
