import Link from "next/link";

import { Logo } from "@/components/notes/Logo";

import { LogInForm } from "./LogInForm";

export function LogInPage() {
  return (
    <section className="flex min-h-dvh items-center justify-center overflow-y-auto bg-background px-4 py-8 sm:px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col items-center px-6 pt-8 text-center sm:px-8 sm:pt-10">
          <Logo />
          <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-[1.75rem]">
            Welcome to Note
          </h1>
          <p className="mt-2 text-sm text-muted">Please log in to continue</p>
        </div>

        <div className="px-6 py-8 sm:px-8">
          <LogInForm />
        </div>

        <p className="border-t border-border px-6 py-6 text-center text-sm text-muted sm:px-8">
          No account yet?{" "}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-foreground underline-offset-2 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  );
}
