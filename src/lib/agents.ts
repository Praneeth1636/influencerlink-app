import type { Campaign, Influencer } from "@/data/marketplace";

export function scoreInfluencer(influencer: Influencer, campaign: Campaign) {
  const nicheMatch = influencer.niche === campaign.niche ? 30 : 0;
  const audienceMatch = campaign.audience
    .toLowerCase()
    .split(/[,\s-]+/)
    .filter(Boolean)
    .some((term) => influencer.audience.toLowerCase().includes(term))
    ? 18
    : 0;
  const affordability = influencer.rate <= campaign.budget ? 20 : 6;
  const engagement = Math.min(18, influencer.engagementRate * 2);
  const safety = influencer.brandSafety >= 90 ? 10 : 4;
  const availability = influencer.availability === "Available" ? 8 : influencer.availability === "Limited" ? 4 : 0;

  return Math.round(nicheMatch + audienceMatch + affordability + engagement + safety + availability);
}

export function buildCreatorPitch(influencer: Influencer) {
  return `Hi, I am ${influencer.name}. I create ${influencer.niche.toLowerCase()} content for ${influencer.audience}. My average post reaches ${formatNumber(
    influencer.avgViews
  )} views with ${influencer.engagementRate}% engagement. I am best for brands that need practical, trust-building content with clear deliverables.`;
}

export function draftBrandOutreach(influencer: Influencer, campaign: Campaign) {
  const deliverables = campaign.deliverables.map((deliverable) => deliverable.title).join(", ");
  return `Hi ${influencer.name}, we are ${campaign.brand}. We are looking for a ${influencer.niche.toLowerCase()} creator for: ${campaign.goal}. We think your audience of ${influencer.audience.toLowerCase()} is a strong fit. Budget target is $${influencer.rate.toLocaleString()} for ${deliverables}. Are you open to discussing availability for ${campaign.timeline.toLowerCase()}?`;
}

export function suggestRate(influencer: Influencer) {
  const base = influencer.avgViews * 0.012;
  const engagementPremium = influencer.engagementRate > 7 ? 1.25 : influencer.engagementRate > 5 ? 1.1 : 1;
  const platformPremium = influencer.platforms.length >= 3 ? 1.15 : 1;
  const suggested = Math.round((base * engagementPremium * platformPremium) / 50) * 50;
  const floor = Math.max(250, suggested - 250);
  const ceiling = suggested + 350;

  return {
    suggested,
    range: `$${floor.toLocaleString()}-$${ceiling.toLocaleString()}`,
    reason: `${formatNumber(influencer.avgViews)} average views, ${influencer.engagementRate}% engagement, ${influencer.platforms.length} active platforms`
  };
}

export function campaignBrief(campaign: Campaign) {
  const deliverables = campaign.deliverables.map((deliverable) => deliverable.title).join(", ");
  return `${campaign.brand} wants to ${campaign.goal.toLowerCase()}. Target audience: ${campaign.audience}. Recommended creator niche: ${campaign.niche}. Package: ${deliverables}. Timeline: ${campaign.timeline}.`;
}

export function formatNumber(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return value.toLocaleString();
}
