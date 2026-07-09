import type { Metadata } from "next";

import { SignUpPage } from "@/components/auth/SignUpPage";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function Page() {
  return <SignUpPage />;
}
