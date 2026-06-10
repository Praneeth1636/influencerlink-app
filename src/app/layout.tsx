import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/components/auth/clerk-appearance";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TRPCProvider } from "@/lib/trpc/client";
import "./globals.css";

// Bricolage Grotesque — variable display grotesk with optical sizing; carries
// headlines and brand moments. Hanken Grotesk — humanist sans for body/UI.
// JetBrains Mono — numbers + code.
const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif-app"
});
const fontSans = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-app"
});
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-app"
});

export const metadata: Metadata = {
  title: "Terrace",
  description: "AI-powered creator and brand partnership marketplace"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is required by next-themes — it flips the
    // `class` attribute on <html> after hydration to apply the saved theme.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <body>
        <ThemeProvider>
          <ClerkProvider
            appearance={clerkAppearance}
            signInUrl="/login"
            signUpUrl="/signup"
            signInFallbackRedirectUrl="/onboarding"
            signUpFallbackRedirectUrl="/onboarding"
          >
            <TRPCProvider>
              <PostHogProvider>{children}</PostHogProvider>
            </TRPCProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
