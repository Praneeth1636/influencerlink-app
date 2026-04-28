import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "@/components/providers/posthog-provider";
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
        <PostHogProvider>
          <ClerkProvider>{children}</ClerkProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
