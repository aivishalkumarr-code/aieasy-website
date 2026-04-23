import { redirect } from "next/navigation";
import { Lock, Sparkles } from "lucide-react";

import { LoginForm } from "@/app/login/LoginForm";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function LoginPage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    if (data.user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="space-y-8 rounded-[2.5rem] bg-gradient-to-br from-[#0D9488] to-[#115E59] p-10 text-white shadow-card">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/80">
              Protected workspace
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Manage leads, deals, quotes, email, and SEO from one place.
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/85 sm:text-lg">
              AIeasy dashboard centralizes the operating layer for sales and growth workflows,
              with Supabase auth protection and clean operator-focused tools.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Lead statuses and CRM pipeline",
              "Auto-priced quote builder with PDF preview",
              "Email templates with history tracking",
              "SEO controls for every key page",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-white/15 bg-white/10 px-5 py-4 text-sm text-white/90"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90">
            <Lock className="h-4 w-4" />
            Secure access via password or magic link
          </div>
        </section>

        <section>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
