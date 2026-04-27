import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
