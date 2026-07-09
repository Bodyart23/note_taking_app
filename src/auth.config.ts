import type { NextAuthConfig } from "next-auth";

import type { UserRole } from "@/types/user";

/**
 * Edge-safe Auth.js configuration.
 *
 * This file must NOT import Node-only modules (MongoDB driver, bcrypt, etc.)
 * because it is consumed by the proxy (middleware) which runs on the Edge
 * runtime. Providers that need database access live in `auth.ts`.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/log-in",
    error: "/auth/log-in",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub;
        token.role = user.role ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = (token.role ?? "user") as UserRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
