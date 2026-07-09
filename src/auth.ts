import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { authConfig } from "@/auth.config";
import { verifyPassword } from "@/lib/password";
import { getUserByEmail } from "@/lib/users";
import { credentialsSchema } from "@/lib/validation/auth";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(rawCredentials) {
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;
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

// Only enable Google OAuth when credentials are configured, so a missing
// client id/secret does not break the credentials login flow.
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
});
