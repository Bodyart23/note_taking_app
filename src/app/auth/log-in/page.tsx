import type { Metadata } from "next";

import { LogInPage } from "@/components/auth/LogInPage";

export const metadata: Metadata = {
  title: "Log In",
};

export default function Page() {
  return <LogInPage />;
}
