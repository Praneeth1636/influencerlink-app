import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata = {
  title: "Pricing - Terrace",
  description: "Simple pricing for creators and brands."
};

const plans = [
  {
    name: "Creator Free",
    price: "$0",
    desc: "Profile, posting, replies, and a small monthly application limit.",
    features: ["Public creator profile", "Post to the feed", "Reply to brand DMs", "5 job applications/month"]
  },
  {
    name: "Creator Pro",
    price: "$19",
    desc: "For creators who want more visibility, analytics, and deal flow.",
    features: ["Unlimited applications", "Who viewed your profile", "Advanced analytics", "Featured search boost"],
    featured: true
  },
  {
    name: "Brand Growth",
    price: "$99",
    desc: "For teams sourcing creators, posting briefs, and managing outreach.",
    features: ["Full creator search", "100 DMs/month", "10 active briefs", "Saved searches and alerts"]
  }
];

const faqs = [
  [
    "Can creators and brands use the same app?",
    "Yes. Terrace is one shared network with role-aware tools, not two separate products."
  ],
  [
    "Is payment escrow included?",
    "Not in the current plan. Subscriptions are the business model; creator payouts can be added later."
  ],
  [
    "Can we change plans later?",
    "Yes. Stripe Checkout and customer portal support upgrades, downgrades, and cancellation."
  ],
  ["Do free brands get search?", "Yes, with limits so they can feel the product before upgrading."]
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <section className="mx-auto max-w-[1440px] px-4 py-20 text-center sm:px-6 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D86B3D] uppercase">Pricing</p>
          <h1 className="mt-4 text-[clamp(44px,7vw,86px)] leading-[0.94] font-semibold tracking-[-0.08em]">
            Simple plans for both sides of the marketplace.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#787774]">
            Creators pay for analytics and visibility. Brands pay for search, outreach, briefs, and team workflows.
          </p>
        </div>

        <div className="mt-14 grid gap-5 text-left lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              className={`relative rounded-[30px] border bg-white p-6 shadow-[0_18px_54px_rgba(17,24,39,0.045)] ${
                plan.featured ? "border-[#D86B3D]" : "border-[#e9e9e7]"
              }`}
              key={plan.name}
            >
              {plan.featured && (
                <span className="absolute top-5 right-5 rounded-full border border-[#f3d5c4] bg-[#faf0ea] px-3 py-1 text-xs font-semibold text-[#D86B3D]">
                  Recommended
                </span>
              )}
              <h2 className="text-2xl font-semibold tracking-[-0.05em]">{plan.name}</h2>
              <p className="mt-3 min-h-14 text-sm leading-6 text-[#787774]">{plan.desc}</p>
              <div className="mt-8 flex items-end gap-1">
                <span className="text-5xl font-semibold tracking-[-0.07em]">{plan.price}</span>
                <span className="pb-1 text-sm font-medium text-[#787774]">/month</span>
              </div>
              <Link
                className={`mt-8 inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold ${
                  plan.featured
                    ? "bg-[#37352f] text-white hover:bg-[#1d222b]"
                    : "border border-[#e9e9e7] bg-white text-[#37352f] hover:border-[#dce3ea]"
                }`}
                href="/signup"
              >
                Start now
              </Link>
              <ul className="mt-7 grid gap-3">
                {plan.features.map((feature) => (
                  <li className="flex items-start gap-2 text-sm text-[#4b5563]" key={feature}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#D86B3D]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        <div className="rounded-[30px] border border-[#e9e9e7] bg-white p-6 shadow-[0_18px_54px_rgba(17,24,39,0.04)]">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#fff4ee] text-[#D86B3D]">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className="text-2xl font-semibold tracking-[-0.045em]">Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map(([question, answer], index) => (
              <AccordionItem className="border-[#e9e9e7]" key={question} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-semibold text-[#37352f]">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-7 text-[#787774]">{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
  );
}
