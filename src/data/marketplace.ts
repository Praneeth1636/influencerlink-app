export type Platform = "Instagram" | "TikTok" | "YouTube" | "LinkedIn";

export type Influencer = {
  id: string;
  name: string;
  handle: string;
  city: string;
  niche: string;
  platforms: Platform[];
  followers: number;
  avgViews: number;
  engagementRate: number;
  audience: string;
  rate: number;
  availability: "Available" | "Limited" | "Booked";
  brandSafety: number;
  responseTime: string;
  verified: boolean;
  pastBrands: string[];
  bio: string;
  languages: string[];
  contentTypes: string[];
  totalReach: number;
  campaignsCompleted: number;
  audienceDemographics: string[];
  socialAccounts: SocialAccount[];
  contentSamples: ContentSample[];
  collaborations: PastCollaboration[];
};

export type Campaign = {
  id: string;
  brand: string;
  title: string;
  goal: string;
  budget: number;
  budgetRange: string;
  niche: string;
  audience: string;
  timeline: string;
  deliverables: CampaignDeliverable[];
  requirements: string[];
  distribution: "Public" | "Invite-only" | "Hybrid";
  status: "Draft" | "Outreach" | "Negotiating" | "Active";
};

export type Conversation = {
  id: string;
  influencerId: string;
  brand: string;
  subject: string;
  budget: number;
  status: "New" | "Replied" | "Negotiating" | "Ready";
  lastMessage: string;
};

export type SocialAccount = {
  platform: Platform;
  followers: number;
  engagementRate: number;
  lastSyncedAt: string;
};

export type ContentSample = {
  title: string;
  platform: Platform;
  reach: number;
  engagementRate: number;
};

export type PastCollaboration = {
  brand: string;
  title: string;
  reach: number;
  engagementRate: number;
};

export type CampaignDeliverable = {
  id: string;
  title: string;
  platform: Platform;
  status: "Approved" | "Revisions" | "In progress" | "Pending";
};

export const influencers: Influencer[] = [
  {
    id: "sara",
    name: "Sara Rivera",
    handle: "@sararivera",
    city: "Los Angeles, CA",
    niche: "Beauty",
    platforms: ["Instagram", "TikTok", "YouTube"],
    followers: 2400000,
    avgViews: 680000,
    engagementRate: 5.8,
    audience: "Women 18-34, US beauty and lifestyle buyers",
    rate: 3200,
    availability: "Available",
    brandSafety: 97,
    responseTime: "1d",
    verified: true,
    pastBrands: ["Glossier", "Sephora", "Rare Beauty"],
    bio: "Beauty and lifestyle creator known for launch-day routines, GRWM content, and trusted product breakdowns.",
    languages: ["English", "Spanish"],
    contentTypes: ["GRWM", "Product demos", "Launch campaigns"],
    totalReach: 2400000,
    campaignsCompleted: 47,
    audienceDemographics: ["78% female", "Ages 18-34", "62% US"],
    socialAccounts: [
      { platform: "Instagram", followers: 1200000, engagementRate: 5.6, lastSyncedAt: "2026-04-25" },
      { platform: "TikTok", followers: 890000, engagementRate: 6.4, lastSyncedAt: "2026-04-25" },
      { platform: "YouTube", followers: 310000, engagementRate: 4.2, lastSyncedAt: "2026-04-24" }
    ],
    contentSamples: [
      { title: "Everyday serum launch", platform: "TikTok", reach: 2100000, engagementRate: 6.2 },
      { title: "Summer routine short", platform: "YouTube", reach: 840000, engagementRate: 4.8 }
    ],
    collaborations: [
      { brand: "Glossier", title: "Summer launch", reach: 2100000, engagementRate: 6.2 },
      { brand: "Sephora", title: "Clean beauty edit", reach: 1800000, engagementRate: 4.9 }
    ]
  },
  {
    id: "maya",
    name: "Maya Torres",
    handle: "@maya.moves",
    city: "Austin, TX",
    niche: "Fitness",
    platforms: ["Instagram", "TikTok", "YouTube"],
    followers: 184000,
    avgViews: 72000,
    engagementRate: 6.8,
    audience: "Women 18-30, wellness beginners",
    rate: 950,
    availability: "Available",
    brandSafety: 94,
    responseTime: "4h",
    verified: true,
    pastBrands: ["Alo", "Hydrant", "ClassPass"],
    bio: "Trainer and creator making beginner-friendly strength routines and habit challenges.",
    languages: ["English"],
    contentTypes: ["Tutorials", "Challenges", "Routine videos"],
    totalReach: 184000,
    campaignsCompleted: 19,
    audienceDemographics: ["71% female", "Ages 18-30", "58% US"],
    socialAccounts: [
      { platform: "Instagram", followers: 86000, engagementRate: 6.1, lastSyncedAt: "2026-04-25" },
      { platform: "TikTok", followers: 74000, engagementRate: 7.3, lastSyncedAt: "2026-04-25" },
      { platform: "YouTube", followers: 24000, engagementRate: 4.8, lastSyncedAt: "2026-04-23" }
    ],
    contentSamples: [
      { title: "Beginner strength reset", platform: "TikTok", reach: 122000, engagementRate: 7.1 },
      { title: "Protein habit challenge", platform: "Instagram", reach: 98000, engagementRate: 6.4 }
    ],
    collaborations: [
      { brand: "Alo", title: "Starter strength series", reach: 154000, engagementRate: 6.6 },
      { brand: "Hydrant", title: "Morning routine", reach: 98000, engagementRate: 7.2 }
    ]
  },
  {
    id: "dev",
    name: "Dev Shah",
    handle: "@devdines",
    city: "New York, NY",
    niche: "Food",
    platforms: ["Instagram", "TikTok"],
    followers: 92000,
    avgViews: 54000,
    engagementRate: 8.1,
    audience: "NYC food explorers, 21-38",
    rate: 700,
    availability: "Limited",
    brandSafety: 91,
    responseTime: "7h",
    verified: true,
    pastBrands: ["Resy", "Oatly", "Sweetgreen"],
    bio: "Neighborhood restaurant guides, short-form reviews, and launch-night coverage.",
    languages: ["English"],
    contentTypes: ["Restaurant reviews", "Launch coverage", "Stories"],
    totalReach: 92000,
    campaignsCompleted: 24,
    audienceDemographics: ["54% female", "Ages 21-38", "82% NYC"],
    socialAccounts: [
      { platform: "Instagram", followers: 51000, engagementRate: 7.9, lastSyncedAt: "2026-04-25" },
      { platform: "TikTok", followers: 41000, engagementRate: 8.4, lastSyncedAt: "2026-04-25" }
    ],
    contentSamples: [
      { title: "New ramen counter", platform: "TikTok", reach: 88000, engagementRate: 8.9 },
      { title: "Date-night list", platform: "Instagram", reach: 62000, engagementRate: 7.4 }
    ],
    collaborations: [
      { brand: "Resy", title: "Hidden tables", reach: 73000, engagementRate: 8.1 },
      { brand: "Oatly", title: "Cafe crawl", reach: 61000, engagementRate: 7.6 }
    ]
  },
  {
    id: "lena",
    name: "Lena Brooks",
    handle: "@lenastyled",
    city: "Los Angeles, CA",
    niche: "Fashion",
    platforms: ["Instagram", "YouTube"],
    followers: 310000,
    avgViews: 118000,
    engagementRate: 4.9,
    audience: "Style-conscious women 20-35",
    rate: 1800,
    availability: "Available",
    brandSafety: 96,
    responseTime: "1d",
    verified: true,
    pastBrands: ["Reformation", "Glossier", "Nordstrom"],
    bio: "Capsule wardrobe edits, styling sessions, and product-led lookbooks.",
    languages: ["English"],
    contentTypes: ["Lookbooks", "Styling sessions", "Product edits"],
    totalReach: 310000,
    campaignsCompleted: 32,
    audienceDemographics: ["76% female", "Ages 20-35", "68% US"],
    socialAccounts: [
      { platform: "Instagram", followers: 240000, engagementRate: 5.2, lastSyncedAt: "2026-04-25" },
      { platform: "YouTube", followers: 70000, engagementRate: 3.9, lastSyncedAt: "2026-04-24" }
    ],
    contentSamples: [
      { title: "Capsule refresh", platform: "Instagram", reach: 188000, engagementRate: 5.1 },
      { title: "Workwear edit", platform: "YouTube", reach: 92000, engagementRate: 4.0 }
    ],
    collaborations: [
      { brand: "Reformation", title: "Spring capsule", reach: 241000, engagementRate: 5.3 },
      { brand: "Nordstrom", title: "Occasionwear edit", reach: 190000, engagementRate: 4.7 }
    ]
  },
  {
    id: "omar",
    name: "Omar Reed",
    handle: "@omarbuilds",
    city: "Seattle, WA",
    niche: "Tech",
    platforms: ["YouTube", "LinkedIn", "TikTok"],
    followers: 126000,
    avgViews: 38000,
    engagementRate: 5.4,
    audience: "Founders, builders, and tech buyers 24-44",
    rate: 1200,
    availability: "Available",
    brandSafety: 98,
    responseTime: "6h",
    verified: true,
    pastBrands: ["Notion", "Vercel", "Linear"],
    bio: "Practical product reviews, AI workflow demos, and founder tool breakdowns.",
    languages: ["English"],
    contentTypes: ["Product demos", "Founder tools", "Workflow explainers"],
    totalReach: 126000,
    campaignsCompleted: 21,
    audienceDemographics: ["64% male", "Ages 24-44", "49% founders"],
    socialAccounts: [
      { platform: "YouTube", followers: 65000, engagementRate: 4.8, lastSyncedAt: "2026-04-24" },
      { platform: "LinkedIn", followers: 39000, engagementRate: 5.9, lastSyncedAt: "2026-04-25" },
      { platform: "TikTok", followers: 22000, engagementRate: 5.8, lastSyncedAt: "2026-04-25" }
    ],
    contentSamples: [
      { title: "AI project stack", platform: "LinkedIn", reach: 72000, engagementRate: 6.2 },
      { title: "Founder OS tour", platform: "YouTube", reach: 58000, engagementRate: 4.7 }
    ],
    collaborations: [
      { brand: "Notion", title: "Team AI workflow", reach: 81000, engagementRate: 5.9 },
      { brand: "Vercel", title: "Launch teardown", reach: 69000, engagementRate: 5.0 }
    ]
  },
  {
    id: "nia",
    name: "Nia Carter",
    handle: "@niaoutdoors",
    city: "Denver, CO",
    niche: "Travel",
    platforms: ["Instagram", "TikTok", "YouTube"],
    followers: 76000,
    avgViews: 46000,
    engagementRate: 7.2,
    audience: "Adventure travelers, couples 25-40",
    rate: 620,
    availability: "Available",
    brandSafety: 93,
    responseTime: "3h",
    verified: false,
    pastBrands: ["Cotopaxi", "Hipcamp", "AllTrails"],
    bio: "Weekend itineraries, gear testing, and outdoor trip planning.",
    languages: ["English"],
    contentTypes: ["Itineraries", "Gear tests", "Travel shorts"],
    totalReach: 76000,
    campaignsCompleted: 16,
    audienceDemographics: ["57% female", "Ages 25-40", "74% US"],
    socialAccounts: [
      { platform: "Instagram", followers: 36000, engagementRate: 7.1, lastSyncedAt: "2026-04-25" },
      { platform: "TikTok", followers: 28000, engagementRate: 7.8, lastSyncedAt: "2026-04-25" },
      { platform: "YouTube", followers: 12000, engagementRate: 5.6, lastSyncedAt: "2026-04-23" }
    ],
    contentSamples: [
      { title: "Weekend trail guide", platform: "TikTok", reach: 71000, engagementRate: 8.0 },
      { title: "Cabin packing list", platform: "Instagram", reach: 53000, engagementRate: 6.9 }
    ],
    collaborations: [
      { brand: "Cotopaxi", title: "Pack test", reach: 62000, engagementRate: 7.4 },
      { brand: "AllTrails", title: "Trail weekend", reach: 59000, engagementRate: 7.0 }
    ]
  },
  {
    id: "aria",
    name: "Aria Kim",
    handle: "@ariaskinlab",
    city: "Chicago, IL",
    niche: "Beauty",
    platforms: ["TikTok", "Instagram"],
    followers: 224000,
    avgViews: 134000,
    engagementRate: 9.3,
    audience: "Skincare shoppers 18-34",
    rate: 1500,
    availability: "Booked",
    brandSafety: 89,
    responseTime: "2d",
    verified: true,
    pastBrands: ["Tower 28", "Sephora", "Bubble"],
    bio: "Ingredient explainers, routine resets, and launch comparison videos.",
    languages: ["English", "Korean"],
    contentTypes: ["Ingredient explainers", "Routine resets", "Launch comparisons"],
    totalReach: 224000,
    campaignsCompleted: 29,
    audienceDemographics: ["81% female", "Ages 18-34", "66% US"],
    socialAccounts: [
      { platform: "TikTok", followers: 152000, engagementRate: 9.8, lastSyncedAt: "2026-04-25" },
      { platform: "Instagram", followers: 72000, engagementRate: 8.4, lastSyncedAt: "2026-04-25" }
    ],
    contentSamples: [
      { title: "Barrier repair test", platform: "TikTok", reach: 241000, engagementRate: 9.1 },
      { title: "Cleanser comparison", platform: "Instagram", reach: 132000, engagementRate: 8.5 }
    ],
    collaborations: [
      { brand: "Tower 28", title: "Barrier campaign", reach: 212000, engagementRate: 9.0 },
      { brand: "Bubble", title: "Routine reset", reach: 174000, engagementRate: 8.6 }
    ]
  },
  {
    id: "jamie",
    name: "Jamie Kim",
    handle: "@jamiekbeauty",
    city: "San Diego, CA",
    niche: "Beauty",
    platforms: ["Instagram", "TikTok"],
    followers: 580000,
    avgViews: 190000,
    engagementRate: 7.1,
    audience: "Women 18-34, US skincare shoppers",
    rate: 1800,
    availability: "Available",
    brandSafety: 95,
    responseTime: "8h",
    verified: true,
    pastBrands: ["Glow Recipe", "Summer Fridays", "Tatcha"],
    bio: "K-beauty routines, ingredient education, and high-converting product trials.",
    languages: ["English", "Korean"],
    contentTypes: ["Skincare routines", "Product trials", "Before-after posts"],
    totalReach: 580000,
    campaignsCompleted: 34,
    audienceDemographics: ["82% female", "Ages 18-34", "69% US"],
    socialAccounts: [
      { platform: "Instagram", followers: 330000, engagementRate: 6.6, lastSyncedAt: "2026-04-25" },
      { platform: "TikTok", followers: 250000, engagementRate: 7.8, lastSyncedAt: "2026-04-25" }
    ],
    contentSamples: [
      { title: "Glass skin week", platform: "TikTok", reach: 410000, engagementRate: 7.9 },
      { title: "Sunscreen test", platform: "Instagram", reach: 260000, engagementRate: 6.4 }
    ],
    collaborations: [
      { brand: "Glow Recipe", title: "Dew drops push", reach: 480000, engagementRate: 7.4 },
      { brand: "Tatcha", title: "Night routine", reach: 390000, engagementRate: 6.9 }
    ]
  },
  {
    id: "maye",
    name: "Maya Adeyemi",
    handle: "@maya.skin",
    city: "Atlanta, GA",
    niche: "Skincare",
    platforms: ["TikTok", "Instagram"],
    followers: 320000,
    avgViews: 142000,
    engagementRate: 8.4,
    audience: "Women 18-30, sensitive-skin buyers",
    rate: 1200,
    availability: "Available",
    brandSafety: 93,
    responseTime: "5h",
    verified: true,
    pastBrands: ["Bubble", "Topicals", "Hero"],
    bio: "Skincare educator focused on sensitive skin, acne-safe routines, and affordable product swaps.",
    languages: ["English"],
    contentTypes: ["Routine education", "Product swaps", "UGC concepts"],
    totalReach: 320000,
    campaignsCompleted: 22,
    audienceDemographics: ["84% female", "Ages 18-30", "71% US"],
    socialAccounts: [
      { platform: "TikTok", followers: 210000, engagementRate: 8.7, lastSyncedAt: "2026-04-25" },
      { platform: "Instagram", followers: 110000, engagementRate: 7.9, lastSyncedAt: "2026-04-25" }
    ],
    contentSamples: [
      { title: "Acne-safe routine", platform: "TikTok", reach: 286000, engagementRate: 8.8 },
      { title: "Serum comparison", platform: "Instagram", reach: 151000, engagementRate: 7.7 }
    ],
    collaborations: [
      { brand: "Topicals", title: "Sensitive skin push", reach: 301000, engagementRate: 8.6 },
      { brand: "Hero", title: "Patch education", reach: 196000, engagementRate: 8.1 }
    ]
  }
];

export const campaigns: Campaign[] = [
  {
    id: "glossier-summer",
    brand: "Glossier",
    title: "Summer launch campaign",
    goal: "Launch a summer beauty collection through trusted GRWM and routine-led creator content",
    budget: 8500,
    budgetRange: "$7.5K-$9K",
    niche: "Beauty",
    audience: "Women 18-34",
    timeline: "Deadline June 15",
    deliverables: [
      { id: "d1", title: "Instagram Reel - product unboxing", platform: "Instagram", status: "Approved" },
      { id: "d2", title: "TikTok video - GRWM tutorial", platform: "TikTok", status: "Approved" },
      { id: "d3", title: "Instagram carousel - 3 looks", platform: "Instagram", status: "Revisions" },
      { id: "d4", title: "YouTube short - routine", platform: "YouTube", status: "Pending" }
    ],
    requirements: ["Beauty creators", "100K-1M followers", "US audience", "5%+ engagement"],
    distribution: "Hybrid",
    status: "Active"
  },
  {
    id: "fit-launch",
    brand: "PulseFuel",
    title: "Clean pre-workout launch",
    goal: "Launch a clean pre-workout to women starting strength training",
    budget: 5000,
    budgetRange: "$4K-$5K",
    niche: "Fitness",
    audience: "Women 18-30",
    timeline: "Next 21 days",
    deliverables: [
      { id: "pf1", title: "TikTok product trial", platform: "TikTok", status: "In progress" },
      { id: "pf2", title: "Instagram story sequence", platform: "Instagram", status: "Pending" }
    ],
    requirements: ["Fitness creators", "Women 18-30 audience", "US or Canada", "No competitor posts in 90 days"],
    distribution: "Invite-only",
    status: "Outreach"
  },
  {
    id: "food-pop",
    brand: "Juniper Kitchen",
    title: "Dinner menu reservations push",
    goal: "Drive reservations for a new dinner menu in NYC",
    budget: 2200,
    budgetRange: "$1.8K-$2.2K",
    niche: "Food",
    audience: "NYC diners 21-38",
    timeline: "Next 10 days",
    deliverables: [
      { id: "jk1", title: "Instagram Reel - menu preview", platform: "Instagram", status: "Pending" },
      { id: "jk2", title: "Story frames with booking link", platform: "Instagram", status: "Pending" }
    ],
    requirements: ["NYC food creators", "21-38 audience", "Restaurant content", "Strong local engagement"],
    distribution: "Public",
    status: "Draft"
  }
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    influencerId: "maya",
    brand: "PulseFuel",
    subject: "Pre-workout launch collaboration",
    budget: 950,
    status: "New",
    lastMessage: "We love your beginner strength series and want to partner for our May launch."
  },
  {
    id: "c2",
    influencerId: "omar",
    brand: "StackPilot",
    subject: "AI workflow tool review",
    budget: 1400,
    status: "Negotiating",
    lastMessage: "Could we include a product demo plus a 60-day usage rights clause?"
  },
  {
    id: "c3",
    influencerId: "dev",
    brand: "Juniper Kitchen",
    subject: "New menu preview night",
    budget: 650,
    status: "Replied",
    lastMessage: "Happy to come in this week. I can do a reel plus day-of stories."
  }
];
