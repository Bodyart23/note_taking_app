"use client";

import { SessionProvider } from "next-auth/react";

import { SESSION_MAX_AGE_SECONDS } from "@/auth.config";

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider
      refetchInterval={Math.min(60, SESSION_MAX_AGE_SECONDS)}
      refetchOnWindowFocus
    >
      {children}
    </SessionProvider>
  );
}
