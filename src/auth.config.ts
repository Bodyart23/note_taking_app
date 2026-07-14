import type { NextAuthConfig } from "next-auth";

import type { UserRole } from "@/types/user";

/** Absolute session lifetime in seconds (5 minutes from sign-in). */
export const SESSION_MAX_AGE_SECONDS = 5 * 60;

/**
 * Edge-safe Auth.js configuration.
 *
 * This file must NOT import Node-only modules (MongoDB driver, bcrypt, etc.)
 * because it is consumed by the proxy (middleware) which runs on the Edge
 * runtime. Providers that need database access live in `auth.ts`.
 */
export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    // Do not slide/refresh sessions before absolute expiry.
    updateAge: SESSION_MAX_AGE_SECONDS,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  pages: {
    signIn: "/auth/log-in",
    error: "/auth/log-in",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000);

      if (user) {
        token.id = user.id ?? token.sub;
        token.role = user.role ?? "user";
        // Absolute clock from sign-in — not extended by /api/auth/session polls.
        token.loginAt = now;
        token.expiresAt = now + SESSION_MAX_AGE_SECONDS;
        return token;
      }

      const expiresAt =
        typeof token.expiresAt === "number"
          ? token.expiresAt
          : typeof token.loginAt === "number"
            ? token.loginAt + SESSION_MAX_AGE_SECONDS
            : undefined;

      if (expiresAt !== undefined && now >= expiresAt) {
        // Returning null invalidates the JWT / session for Auth.js.
        return null;
      }

      if (expiresAt !== undefined) {
        token.expiresAt = expiresAt;
      }

      return token;
    },
    session({ session, token }) {
      if (!token?.id && !token?.sub) {
        return session;
      }

      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = (token.role ?? "user") as UserRole;
      }

      if (typeof token.expiresAt === "number") {
        // Auth.js Session.expires is typed as Date & string; runtime value is an ISO string.
        (session as { expires: string }).expires = new Date(
          token.expiresAt * 1000,
        ).toISOString();
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
