// Plan card for the pricing surface. `popular` flips the border + CTA variant
// and pins a "Most Popular" badge above the card.

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  ctaText: string;
  popular?: boolean;
  onCtaClick?: () => void;
}

export function PricingCard({ title, price, description, features, ctaText, popular, onCtaClick }: PricingCardProps) {
  return (
    <Card
      className={`hover-elevate relative flex flex-col transition-all duration-300 ${
        popular ? "border-primary shadow-md" : "border-border"
      }`}
    >
      {popular && (
        <Badge className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1">
          Most Popular
        </Badge>
      )}
      <CardHeader className="pt-8 pb-4 text-center">
        <h3 className="font-serif text-xl font-bold">{title}</h3>
        <div className="mt-4 flex items-baseline justify-center gap-1">
          <span className="font-mono text-4xl font-bold">{price}</span>
          {price !== "Free" && <span className="text-muted-foreground text-sm">/mo</span>}
        </div>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-0">
        <Button className="w-full" variant={popular ? "default" : "outline"} onClick={onCtaClick}>
          {ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}
