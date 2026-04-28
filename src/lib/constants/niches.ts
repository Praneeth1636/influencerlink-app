// Canonical creator niches. Used in onboarding multi-select, search filters,
// and campaign matching. Keep alphabetised to make the picklist scannable.
export const NICHES = [
  "Beauty",
  "Business",
  "Comedy",
  "DIY",
  "Education",
  "Family",
  "Fashion",
  "Finance",
  "Fitness",
  "Food",
  "Gaming",
  "Health",
  "Home",
  "Lifestyle",
  "Music",
  "Outdoors",
  "Parenting",
  "Pets",
  "Photography",
  "Politics",
  "Skincare",
  "Sports",
  "Sustainability",
  "Tech",
  "Travel",
  "Wellness"
] as const;

export type Niche = (typeof NICHES)[number];

export function isNiche(value: string): value is Niche {
  return (NICHES as readonly string[]).includes(value);
}
