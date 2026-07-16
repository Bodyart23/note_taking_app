"use client";

import type { Session } from "next-auth";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { SESSION_MAX_AGE_SECONDS } from "@/auth.config";

/**
 * How often (at most) the client asks the server to slide the idle-timeout
 * window while the user is active. Keeping this well below the session
 * maxAge guarantees an active user never hits the expiry.
 */
const ACTIVITY_EXTEND_INTERVAL_MS =
  Math.min(60, Math.floor(SESSION_MAX_AGE_SECONDS / 3)) * 1000;

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "wheel",
  "touchstart",
  "scroll",
] as const;

function SessionExpiryWatcher({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const wasAuthenticatedRef = useRef(false);
  const lastActivityAtRef = useRef<number>(0);
  const lastExtendAtRef = useRef(0);
  const isAuthRoute = pathname.startsWith("/auth");

  useEffect(() => {
    if (status === "authenticated") {
      wasAuthenticatedRef.current = true;
    }
  }, [status]);

  // Initialize after mount to avoid calling impure functions (Date.now) during
  // render, which would otherwise trip eslint's purity rule.
  useEffect(() => {
    lastActivityAtRef.current = Date.now();
  }, []);

  // Track user activity and periodically ask the server to extend the
  // session while the user is active, sliding the idle-timeout window.
  useEffect(() => {
    if (status !== "authenticated" || isAuthRoute) return;

    const onActivity = () => {
      lastActivityAtRef.current = Date.now();
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const activeRecently =
        now - lastActivityAtRef.current < ACTIVITY_EXTEND_INTERVAL_MS;
      const extendDue =
        now - lastExtendAtRef.current >= ACTIVITY_EXTEND_INTERVAL_MS;

      if (activeRecently && extendDue) {
        // Optimistic lock to avoid parallel extend calls; rolled back if the
        // request is skipped (e.g. SessionProvider still loading) or fails.
        lastExtendAtRef.current = now;
        // Auth.js only sets jwt `trigger: "update"` on POST /session.
        // `update()` with no args does a GET and never slides expiresAt —
        // pass a body so the idle-timeout window actually extends.
        void update({ extendedAt: now }).then((nextSession) => {
          if (!nextSession) {
            lastExtendAtRef.current = 0;
          }
        });
      }
    }, 15_000);

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
      window.clearInterval(intervalId);
    };
  }, [isAuthRoute, status, update]);

  // Hard timeout based on session.expires from the server JWT. Re-arms
  // whenever the expiry moves forward after an activity-driven extension.
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

    // One last extend attempt before absolute expiry. Must run early — the
    // jwt callback rejects tokens once `expiresAt` has already passed.
    const leadMs = Math.min(20_000, Math.max(0, msUntilExpiry - 1_000));
    const extendTimeoutId = window.setTimeout(() => {
      const recentlyActive =
        Date.now() - lastActivityAtRef.current < ACTIVITY_EXTEND_INTERVAL_MS;
      if (!recentlyActive) return;

      const now = Date.now();
      lastExtendAtRef.current = now;
      void update({ extendedAt: now }).then((nextSession) => {
        if (!nextSession) {
          lastExtendAtRef.current = 0;
        }
      });
    }, leadMs);

    const timeoutId = window.setTimeout(() => {
      void signOut({ callbackUrl: "/auth/log-in" });
    }, msUntilExpiry + 250);

    return () => {
      window.clearTimeout(extendTimeoutId);
      window.clearTimeout(timeoutId);
    };
  }, [isAuthRoute, session?.expires, status, update]);

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
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider
      // Hydrating the provider with the server-fetched session marks it as
      // already synced, so the client skips the /api/auth/session fetch on
      // mount. The refetch interval keeps it fresh afterwards.
      session={session}
      refetchInterval={Math.min(30, SESSION_MAX_AGE_SECONDS)}
      refetchOnWindowFocus
    >
      <SessionExpiryWatcher>{children}</SessionExpiryWatcher>
    </SessionProvider>
  );
}
