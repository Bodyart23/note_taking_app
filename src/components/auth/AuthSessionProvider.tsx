"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { SESSION_MAX_AGE_SECONDS } from "@/auth.config";

function SessionExpiryWatcher({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const wasAuthenticatedRef = useRef(false);
  const isAuthRoute = pathname.startsWith("/auth");

  useEffect(() => {
    if (status === "authenticated") {
      wasAuthenticatedRef.current = true;
    }
  }, [status]);

  // Hard timeout based on session.expires from the server JWT.
  useEffect(() => {
    if (status !== "authenticated" || !session?.expires || isAuthRoute) {
      return;
    }

    const expiresAtMs = new Date(session.expires).getTime();
    const msUntilExpiry = expiresAtMs - Date.now();

    if (Number.isNaN(expiresAtMs)) return;

    if (msUntilExpiry <= 0) {
      void signOut({ callbackUrl: "/auth/log-in" });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void signOut({ callbackUrl: "/auth/log-in" });
    }, msUntilExpiry + 250);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthRoute, session?.expires, status]);

  // If a refetch discovers the server session is gone, leave protected pages.
  useEffect(() => {
    if (
      wasAuthenticatedRef.current &&
      status === "unauthenticated" &&
      !isAuthRoute
    ) {
      void signOut({ callbackUrl: "/auth/log-in" });
    }
  }, [isAuthRoute, status]);

  return children;
}

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider
      refetchInterval={Math.min(30, SESSION_MAX_AGE_SECONDS)}
      refetchOnWindowFocus
    >
      <SessionExpiryWatcher>{children}</SessionExpiryWatcher>
    </SessionProvider>
  );
}
