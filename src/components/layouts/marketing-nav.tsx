"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { clerkAppearance } from "@/components/auth/clerk-appearance";

export function MarketingNav() {
  const { theme, setTheme } = useTheme();
  const { isSignedIn, user } = useUser();
  const dashboardHref = user?.publicMetadata?.brandId ? "/feed" : "/creator";

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="text-primary h-6 w-6" />
          <span className="font-serif text-xl font-bold tracking-tight">InfluencerLink</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/jobs" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">
            Briefs
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isSignedIn ? (
            <>
              <Button variant="outline" asChild>
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
              <UserButton appearance={clerkAppearance} />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
