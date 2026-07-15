"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Server components hide error details behind a digest; log what we have
    // so the failure is visible in the browser console during development.
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-bg">
        <TriangleAlert className="h-7 w-7 text-error" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted">
          We couldn&apos;t load your notes. This is usually temporary — check
          your connection and try again.
        </p>
        {error.digest ? (
          <p className="text-xs text-muted">Error reference: {error.digest}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={reset}
        className="flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
