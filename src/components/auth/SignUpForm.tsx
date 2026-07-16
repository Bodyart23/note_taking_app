"use client";

import { Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const inputClassName =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand disabled:opacity-60";

function SignUpFormFields() {
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

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      setIsSubmitting(false);
      setError(data.message ?? "Could not create your account.");
      return;
    }

    // Automatically sign the new user in.
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setIsSubmitting(false);

    if (!result || result.error) {
      router.push("/auth/log-in");
      return;
    }

    router.push("/");
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
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
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
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
          At least 8 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}

export function SignUpForm() {
  return <SignUpFormFields />;
}
