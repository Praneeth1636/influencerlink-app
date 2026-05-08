// Public pricing page with FAQ accordion. Lives at /pricing under the
// marketing layout. Server component — pure content, no client hooks.

import { PricingCard } from "@/components/domain/pricing-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata = {
  title: "Pricing — Terrace",
  description: "Simple, transparent pricing for creators and brands."
};

const FAQS = [
  {
    question: "Can I switch plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Upgrades are prorated for the remainder of the billing cycle; downgrades apply on your next billing cycle."
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "No. The price you see is the price you pay. For brands on the Business plan we take a small platform fee on creator payouts to cover payment processing — disclosed up-front."
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact our support team within your first 14 days for a full refund."
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "All major credit cards (Visa, Mastercard, Amex, Discover) and PayPal. Annual Business plans can pay by wire transfer on request."
  }
];

export default function PricingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <section className="bg-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose the plan that best fits your needs. No hidden fees, ever.
            </p>
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

      <section className="py-24">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about the product and billing.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={faq.question} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
