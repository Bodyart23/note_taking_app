"use client";

import { changePassword } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/ui/Toast";

const inputClassName =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand disabled:opacity-60";

export function ChangePasswordSettings() {
  const { showToast } = useToast();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("old-password") ?? "");
    const newPassword = String(formData.get("new-password") ?? "");
    const confirmPassword = String(formData.get("confirm-password") ?? "");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({ currentPassword, newPassword });
      form.reset();
      showToast({ message: "Password changed successfully!" });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not update password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 py-6 lg:w-3/5 lg:px-8">
      <div>
        <h3 className="text-xl font-bold text-foreground">Change Password</h3>
      </div>

      <form
        className="flex flex-col space-y-5 py-6"
        onSubmit={handleSubmit}
        noValidate
      >
        {error ? (
          <p
            role="alert"
            className="rounded-lg bg-error-bg px-3 py-2 text-sm text-error"
          >
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="old-password"
            className="text-sm font-medium text-foreground"
          >
            Old Password
          </label>
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              id="old-password"
              name="old-password"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              className={cn(inputClassName, "pr-11")}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition-colors hover:text-foreground"
              aria-label={showOldPassword ? "Hide password" : "Show password"}
            >
              {showOldPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="new-password"
            className="text-sm font-medium text-foreground"
          >
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              id="new-password"
              name="new-password"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={isSubmitting}
              className={cn(inputClassName, "pr-11")}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition-colors hover:text-foreground"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? (
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

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium text-foreground"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              name="confirm-password"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={isSubmitting}
              className={cn(inputClassName, "pr-11")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition-colors hover:text-foreground"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
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
          className="flex h-11 size-30 self-end items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? "Saving..." : "Save Password"}
        </button>
      </form>
    </div>
  );
}
