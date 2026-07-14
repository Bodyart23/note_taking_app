"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { GoogleIcon } from "./GoogleIcon";

const inputClassName =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand disabled:opacity-60";

function LogInFormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-surface-muted" />
        <div className="h-11 w-full rounded-lg bg-surface-muted" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded bg-surface-muted" />
          <div className="h-4 w-12 rounded bg-surface-muted" />
        </div>
        <div className="h-11 w-full rounded-lg bg-surface-muted" />
      </div>
      <div className="h-11 w-full rounded-lg bg-surface-muted" />
      <div className="h-4 w-32 rounded bg-surface-muted" />
      <div className="h-11 w-full rounded-lg bg-surface-muted" />
    </div>
  );
}

function getCallbackUrl(): string {
  const target = new URLSearchParams(window.location.search).get("callbackUrl");
  // Only allow same-site relative paths to avoid open-redirect attacks.
  if (target && target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return "/";
}

function LogInFormFields() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setIsSubmitting(false);

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(getCallbackUrl());
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-error-bg px-3 py-2 text-sm text-error"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          placeholder="email@example.com"
          required
          disabled={isSubmitting}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            autoComplete="current-password"
            required
            disabled={isSubmitting}
            className={cn(inputClassName, "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition-colors hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

export function LogInForm() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LogInFormSkeleton />;
  }

  return <LogInFormFields />;
}
