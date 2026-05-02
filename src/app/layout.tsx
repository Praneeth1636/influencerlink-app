import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/components/auth/clerk-appearance";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TRPCProvider } from "@/lib/trpc/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "InfluencerLink",
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
    <html lang="en" suppressHydrationWarning>
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
