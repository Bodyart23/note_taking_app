import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";

import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Note Taking App",
    template: "%s | Note Taking App",
  },
  description: "A modern note-taking application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col overflow-hidden bg-background font-sans text-foreground">
        <AuthSessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
