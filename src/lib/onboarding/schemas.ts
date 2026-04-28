import { z } from "zod";
import { isNiche } from "@/lib/constants/niches";

const handleRegex = /^[a-z0-9_]+$/;

export const creatorOnboardingSchema = z.object({
  handle: z
    .string()
    .min(3, "Handle must be at least 3 characters")
    .max(30, "Handle must be at most 30 characters")
    .regex(handleRegex, "Handle must be lowercase letters, numbers, or underscores"),
  displayName: z.string().min(1, "Display name is required").max(80),
  headline: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  niches: z
    .array(z.string().refine(isNiche, "Invalid niche"))
    .min(1, "Pick at least one niche")
    .max(5, "Pick at most five niches"),
  location: z.string().max(80).optional().or(z.literal(""))
});

export type CreatorOnboardingInput = z.infer<typeof creatorOnboardingSchema>;

export const brandOnboardingSchema = z.object({
  orgId: z.string().min(1, "Organization is required"),
  name: z.string().min(1, "Brand name is required").max(120),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(60, "Slug must be at most 60 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, or hyphens"),
  industry: z.string().min(1, "Industry is required").max(80),
  sizeRange: z.string().min(1, "Team size is required").max(40),
  about: z.string().max(1000).optional().or(z.literal("")),
  plan: z.enum(["free", "growth", "scale"])
});

export type BrandOnboardingInput = z.infer<typeof brandOnboardingSchema>;

export function slugifyBrandName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
