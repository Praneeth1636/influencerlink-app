import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "@/components/providers/posthog-provider";
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
    <html lang="en">
      <body>
        <ClerkProvider>
          <TRPCProvider>
            <PostHogProvider>{children}</PostHogProvider>
          </TRPCProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
