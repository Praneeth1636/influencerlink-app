// Public landing page. Lives at /. Marketing layout supplies the top nav.
// Server component — no client hooks, fast TTFB, no JS for the hero.

import Link from "next/link";
import { ArrowRight, BarChart, Globe, MessageSquare, Shield, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatorCard, type CreatorCardData } from "@/components/domain/creator-card";
import { PricingCard } from "@/components/domain/pricing-card";

const FEATURES = [
  { icon: Globe, title: "Global Reach", desc: "Connect with creators and brands from all around the world." },
  { icon: BarChart, title: "Data-Driven", desc: "Make informed decisions with real-time analytics and insights." },
  { icon: Shield, title: "Secure Payments", desc: "Safe and transparent escrow system for peace of mind." },
  { icon: MessageSquare, title: "Direct Chat", desc: "Negotiate and coordinate smoothly with built-in messaging." },
  { icon: Zap, title: "Fast Discovery", desc: "Find the perfect match in seconds using advanced filters." },
  { icon: Star, title: "Verified Profiles", desc: "Trust authentic, vetted creators with proven track records." }
];

const FEATURED_CREATORS: CreatorCardData[] = [
  {
    name: "Elena Rivera",
    bio: "Skincare routines for sensitive, melanin-rich skin.",
    niche: "Beauty",
    location: "Brooklyn, NY",
    avatar: null,
    verified: true,
    totalFollowers: 482_000,
    engagementRate: 4.8,
    ratePerPost: 1800,
    platforms: [
      { platform: "Instagram", followers: 320_000 },
      { platform: "TikTok", followers: 162_000 }
    ]
  },
  {
    name: "Marcus Chen",
    bio: "Long-form gear reviews and DIY photography studio builds.",
    niche: "Tech",
    location: "Austin, TX",
    avatar: null,
    verified: true,
    totalFollowers: 1_240_000,
    engagementRate: 3.2,
    ratePerPost: 4500,
    platforms: [
      { platform: "YouTube", followers: 980_000 },
      { platform: "Instagram", followers: 260_000 }
    ]
  },
  {
    name: "Aisha Kapoor",
    bio: "Plant-based meal prep, weeknight efficient and budget honest.",
    niche: "Food",
    location: "Toronto",
    avatar: null,
    verified: false,
    totalFollowers: 215_000,
    engagementRate: 6.1,
    ratePerPost: 950,
    platforms: [
      { platform: "Instagram", followers: 145_000 },
      { platform: "TikTok", followers: 70_000 }
    ]
  },
  {
    name: "Jordan Hayes",
    bio: "Sustainable fashion hauls and capsule-wardrobe deep dives.",
    niche: "Fashion",
    location: "London",
    avatar: null,
    verified: true,
    totalFollowers: 612_000,
    engagementRate: 5.4,
    ratePerPost: 2300,
    platforms: [
      { platform: "Instagram", followers: 410_000 },
      { platform: "YouTube", followers: 202_000 }
    ]
  }
];

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="from-primary/10 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]" />
        <div className="relative z-10 container mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-6 font-serif text-5xl font-extrabold tracking-tight md:text-7xl">
            Connect Brands with <span className="text-primary">Creators</span>
          </h1>
          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg md:text-xl">
            The premier marketplace for authentic influencer marketing. Find the perfect match, manage campaigns, and
            scale your reach effortlessly.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="h-14 rounded-full px-8 text-lg">
              <Link href="/signup">
                Join as Brand
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-background h-14 rounded-full px-8 text-lg">
              <Link href="/signup">Join as Creator</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">Why Terrace?</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              Everything you need to run successful campaigns in one place.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card border-border hover-elevate rounded-2xl border p-6 transition-all">
                <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">Top Creators</h2>
              <p className="text-muted-foreground">Discover talent across all niches.</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/signup">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_CREATORS.map((creator) => (
              <CreatorCard key={creator.name} creator={creator} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/signup">View all Creators</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 border-border border-y py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">Choose the plan that best fits your needs.</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <PricingCard
              title="Free"
              price="$0"
              description="Perfect for new creators getting started."
              features={["Basic profile", "Apply to up to 5 campaigns/mo", "Standard support", "Community access"]}
              ctaText="Get Started"
            />
            <PricingCard
              title="Pro"
              price="$49"
              description="For professional creators and growing brands."
              features={[
                "Enhanced profile",
                "Unlimited campaign applications",
                "Priority support",
                "Advanced analytics"
              ]}
              ctaText="Upgrade to Pro"
              popular
            />
            <PricingCard
              title="Business"
              price="$199"
              description="For agencies and enterprise brands."
              features={["Dedicated account manager", "Custom contracts", "API access", "White-label reporting"]}
              ctaText="Contact Sales"
            />
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground relative overflow-hidden py-24">
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="mb-6 font-serif text-4xl font-bold md:text-5xl">Ready to scale your influence?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl opacity-90">
            Join thousands of creators and brands already collaborating on Terrace.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-primary hover:text-primary h-14 rounded-full px-8 text-lg"
          >
            <Link href="/signup">Create an Account</Link>
          </Button>
        </div>
      </section>

      <footer className="bg-background border-border border-t py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            <span className="font-serif text-lg font-bold tracking-tight">Terrace</span>
          </div>
          <div className="text-muted-foreground flex gap-6 text-sm">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Terrace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
