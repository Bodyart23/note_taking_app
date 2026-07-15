import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { verifyPassword } from "@/lib/password";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserByEmail } from "@/lib/users";
import { credentialsSchema } from "@/lib/validation/auth";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(rawCredentials, request) {
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;

      // Key by IP + email so one address can't hammer an account, while a
      // legitimate user on another network is unaffected. Returning null
      // surfaces the same generic "invalid credentials" as a wrong password.
      const rate = checkRateLimit(
        "log-in",
        `${getClientIp(request)}:${email.toLowerCase()}`,
        { limit: 10, windowMs: 5 * 60 * 1000 },
      );
      if (!rate.ok) return null;

      const user = await getUserByEmail(email);
      if (!user) return null;

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
});
