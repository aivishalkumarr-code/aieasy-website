"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle, Mail, ShieldCheck } from "lucide-react";

import { magicLink, signIn, signUp } from "@/app/dashboard/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LoginMode = "password" | "magic";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePasswordSubmit = (intent: "signIn" | "signUp") => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const action = intent === "signIn" ? signIn : signUp;
      const result = await action({ email, password });

      if (!result.success) {
        setError(result.message ?? "Unable to continue.");
        return;
      }

      setMessage(result.message ?? "Success.");

      if (intent === "signIn") {
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  const handleMagicLink = () => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await magicLink({ email });

      if (!result.success) {
        setError(result.message ?? "Unable to send magic link.");
        return;
      }

      setMessage(result.message ?? "Magic link sent.");
    });
  };

  return (
    <div className="rounded-[2rem] border border-[#DDE7E3] bg-white p-8 shadow-card sm:p-10">
      <div className="space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#1A1A1A]">
            Access your dashboard
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Sign in with email and password or request a secure magic link.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl bg-[#F4F6F2] p-1">
        {[
          { value: "password", label: "Password", icon: KeyRound },
          { value: "magic", label: "Magic link", icon: Mail },
        ].map((option) => {
          const Icon = option.icon;
          const active = mode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value as LoginMode)}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-white text-[#0D9488] shadow-sm"
                  : "text-[#6B7280] hover:text-[#1A1A1A]",
              )}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="h-12 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
          />
        </div>

        {mode === "password" ? (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-[#1A1A1A]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-12 rounded-xl border-[#DDE7E3] bg-[#FAFAF8]"
            />
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-[#F3C5C5] bg-[#FFF5F5] px-4 py-3 text-sm text-[#B42318]">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-xl border border-[#BEE3DD] bg-[#ECFDF5] px-4 py-3 text-sm text-[#0F766E]">
            {message}
          </div>
        ) : null}

        {mode === "password" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              onClick={() => handlePasswordSubmit("signIn")}
              disabled={isPending || !email || !password}
              className="h-12 rounded-xl bg-[#0D9488] text-white hover:bg-[#0F766E]"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Sign in
            </Button>
            <Button
              type="button"
              onClick={() => handlePasswordSubmit("signUp")}
              disabled={isPending || !email || !password}
              variant="outline"
              className="h-12 rounded-xl border-[#DDE7E3] bg-white text-[#1A1A1A]"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Create account
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={handleMagicLink}
            disabled={isPending || !email}
            className="h-12 w-full rounded-xl bg-[#0D9488] text-white hover:bg-[#0F766E]"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Send magic link
          </Button>
        )}
      </div>
    </div>
  );
}
