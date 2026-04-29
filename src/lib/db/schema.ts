import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  vector
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
};

const updatedTimestamp = {
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
};

export const accountTypeEnum = pgEnum("account_type", ["creator", "brand_member", "admin"]);
export const brandRoleEnum = pgEnum("brand_role", ["owner", "admin", "recruiter", "viewer"]);
export const platformEnum = pgEnum("platform", ["instagram", "tiktok", "youtube", "linkedin"]);
export const postAuthorTypeEnum = pgEnum("post_author_type", ["creator", "brand"]);
export const postTypeEnum = pgEnum("post_type", ["update", "milestone", "content_drop", "open_to_work", "job_share"]);
export const postVisibilityEnum = pgEnum("post_visibility", ["public", "connections"]);
export const followedTypeEnum = pgEnum("followed_type", ["creator", "brand"]);
export const jobStatusEnum = pgEnum("job_status", ["draft", "open", "closed", "archived"]);
export const jobApplicationStatusEnum = pgEnum("job_application_status", [
  "submitted",
  "shortlisted",
  "rejected",
  "hired"
]);
export const threadTypeEnum = pgEnum("thread_type", ["direct", "job", "group"]);
export const subscriptionAudienceEnum = pgEnum("subscription_audience", ["creator", "brand"]);
export const subscriptionIntervalEnum = pgEnum("subscription_interval", ["month", "year"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "incomplete",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid"
]);
export const reportStatusEnum = pgEnum("report_status", ["open", "reviewing", "resolved", "dismissed"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  type: accountTypeEnum("type").notNull(),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  ...timestamps
});

export const creators = pgTable("creators", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  handle: text("handle").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  headline: text("headline"),
  location: text("location"),
  niches: text("niches").array().notNull().default([]),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  verified: boolean("verified").notNull().default(false),
  profileViews: integer("profile_views").notNull().default(0),
  openToCollabs: boolean("open_to_collabs").notNull().default(false),
  ratesPublic: boolean("rates_public").notNull().default(false),
  baseRateCents: integer("base_rate_cents"),
  currency: text("currency").notNull().default("USD"),
  ...timestamps,
  ...updatedTimestamp
});

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  about: text("about"),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  industry: text("industry"),
  sizeRange: text("size_range"),
  hqLocation: text("hq_location"),
  verified: boolean("verified").notNull().default(false),
  followerCount: integer("follower_count").notNull().default(0),
  ...timestamps,
  ...updatedTimestamp
});

export const brandMembers = pgTable(
  "brand_members",
  {
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: brandRoleEnum("role").notNull().default("viewer"),
    invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [primaryKey({ columns: [table.brandId, table.userId] })]
);

export const creatorPlatforms = pgTable("creator_platforms", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  externalId: text("external_id").notNull(),
  externalHandle: text("external_handle").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true })
});

export const platformMetrics = pgTable("platform_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorPlatformId: uuid("creator_platform_id")
    .notNull()
    .references(() => creatorPlatforms.id, { onDelete: "cascade" }),
  snapshotDate: timestamp("snapshot_date", { withTimezone: true }).notNull(),
  followers: integer("followers").notNull().default(0),
  avgViews: integer("avg_views").notNull().default(0),
  avgLikes: integer("avg_likes").notNull().default(0),
  avgComments: integer("avg_comments").notNull().default(0),
  engagementRate: numeric("engagement_rate", { precision: 6, scale: 3 }).notNull().default("0"),
  audienceAgeJson: jsonb("audience_age_json").$type<Record<string, number>>().notNull().default({}),
  audienceGenderJson: jsonb("audience_gender_json").$type<Record<string, number>>().notNull().default({}),
  audienceGeoJson: jsonb("audience_geo_json").$type<Record<string, number>>().notNull().default({})
});

export const creatorAggregates = pgTable(
  "creator_aggregates",
  {
    creatorId: uuid("creator_id")
      .primaryKey()
      .references(() => creators.id, { onDelete: "cascade" }),
    totalReach: integer("total_reach").notNull().default(0),
    weightedEngagement: numeric("weighted_engagement", { precision: 6, scale: 3 }).notNull().default("0"),
    primaryNiche: text("primary_niche"),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("creator_aggregates_search_idx").on(
      table.primaryNiche,
      table.totalReach.desc(),
      table.weightedEngagement.desc()
    )
  ]
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorType: postAuthorTypeEnum("author_type").notNull(),
    authorId: uuid("author_id").notNull(),
    body: text("body").notNull(),
    mediaJson: jsonb("media_json").$type<Array<Record<string, unknown>>>().notNull().default([]),
    type: postTypeEnum("type").notNull().default("update"),
    visibility: postVisibilityEnum("visibility").notNull().default("public"),
    ...timestamps,
    ...updatedTimestamp
  },
  (table) => [index("posts_author_created_at_idx").on(table.authorType, table.authorId, table.createdAt.desc())]
);

export const postLikes = pgTable(
  "post_likes",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps
  },
  (table) => [primaryKey({ columns: [table.postId, table.userId] })]
);

export const postComments = pgTable("post_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  parentId: uuid("parent_id"),
  ...timestamps,
  ...updatedTimestamp
});

export const postShares = pgTable("post_shares", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body"),
  ...timestamps
});

export const hashtags = pgTable("hashtags", {
  id: uuid("id").primaryKey().defaultRandom(),
  tag: text("tag").notNull().unique()
});

export const postHashtags = pgTable(
  "post_hashtags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    hashtagId: uuid("hashtag_id")
      .notNull()
      .references(() => hashtags.id, { onDelete: "cascade" })
  },
  (table) => [primaryKey({ columns: [table.postId, table.hashtagId] })]
);

export const follows = pgTable(
  "follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followedType: followedTypeEnum("followed_type").notNull(),
    followedId: uuid("followed_id").notNull(),
    ...timestamps
  },
  (table) => [index("follows_follower_created_at_idx").on(table.followerId, table.createdAt.desc())]
);

export const endorsements = pgTable("endorsements", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromUserId: uuid("from_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  toCreatorId: uuid("to_creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  skill: text("skill").notNull(),
  body: text("body"),
  ...timestamps
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  postedById: uuid("posted_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  deliverables: jsonb("deliverables").$type<Array<Record<string, unknown>>>().notNull().default([]),
  niches: text("niches").array().notNull().default([]),
  minFollowers: integer("min_followers"),
  minEngagement: numeric("min_engagement", { precision: 6, scale: 3 }),
  budgetMinCents: integer("budget_min_cents"),
  budgetMaxCents: integer("budget_max_cents"),
  deadline: timestamp("deadline", { withTimezone: true }),
  location: text("location"),
  remote: boolean("remote").notNull().default(true),
  status: jobStatusEnum("status").notNull().default("draft"),
  applicationCount: integer("application_count").notNull().default(0),
  ...timestamps,
  ...updatedTimestamp
});

export const jobApplications = pgTable("job_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  pitch: text("pitch").notNull(),
  proposedRateCents: integer("proposed_rate_cents"),
  attachments: jsonb("attachments").$type<Array<Record<string, unknown>>>().notNull().default([]),
  status: jobApplicationStatusEnum("status").notNull().default("submitted"),
  ...timestamps,
  ...updatedTimestamp
});

export const jobSavedByCreator = pgTable(
  "job_saved_by_creator",
  {
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [primaryKey({ columns: [table.jobId, table.creatorId] })]
);

export const messageThreads = pgTable("message_threads", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: threadTypeEnum("type").notNull().default("direct"),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
  ...timestamps,
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow()
});

export const threadParticipants = pgTable(
  "thread_participants",
  {
    threadId: uuid("thread_id")
      .notNull()
      .references(() => messageThreads.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    muted: boolean("muted").notNull().default(false)
  },
  (table) => [primaryKey({ columns: [table.threadId, table.userId] })]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => messageThreads.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    attachments: jsonb("attachments").$type<Array<Record<string, unknown>>>().notNull().default([]),
    replyToId: uuid("reply_to_id"),
    ...timestamps,
    editedAt: timestamp("edited_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true })
  },
  (table) => [index("messages_thread_created_at_idx").on(table.threadId, table.createdAt.desc())]
);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  ...timestamps
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  audience: subscriptionAudienceEnum("audience").notNull(),
  priceCents: integer("price_cents").notNull(),
  interval: subscriptionIntervalEnum("interval").notNull().default("month"),
  features: jsonb("features").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps,
  ...updatedTimestamp
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id, { onDelete: "restrict" }),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  status: subscriptionStatusEnum("status").notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  ...timestamps,
  ...updatedTimestamp
});

export const usageQuotas = pgTable("usage_quotas", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "cascade" }),
  period: text("period").notNull(),
  dmsSent: integer("dms_sent").notNull().default(0),
  searchesRun: integer("searches_run").notNull().default(0),
  jobsPosted: integer("jobs_posted").notNull().default(0),
  featuredBoosts: integer("featured_boosts").notNull().default(0)
});

export const profileViews = pgTable("profile_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  viewerId: uuid("viewer_id").references(() => users.id, { onDelete: "set null" }),
  viewedCreatorId: uuid("viewed_creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow()
});

export const searches = pgTable("searches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  query: text("query"),
  filters: jsonb("filters").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").notNull().default("open"),
  ...timestamps,
  ...updatedTimestamp
});

export const embeddingEntityEnum = pgEnum("embedding_entity", ["creator", "campaign"]);

export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: embeddingEntityEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    model: text("model").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    ...timestamps
  },
  (table) => [index("embeddings_entity_idx").on(table.entityType, table.entityId)]
);

export const usersRelations = relations(users, ({ one, many }) => ({
  creator: one(creators),
  brandMemberships: many(brandMembers),
  postsLiked: many(postLikes),
  comments: many(postComments),
  shares: many(postShares),
  endorsementsGiven: many(endorsements),
  jobApplications: many(jobApplications),
  threadParticipants: many(threadParticipants),
  sentMessages: many(messages),
  notifications: many(notifications),
  subscriptions: many(subscriptions),
  searches: many(searches),
  reports: many(reports)
}));

export const creatorsRelations = relations(creators, ({ one, many }) => ({
  user: one(users, {
    fields: [creators.userId],
    references: [users.id]
  }),
  platforms: many(creatorPlatforms),
  aggregate: one(creatorAggregates),
  jobApplications: many(jobApplications),
  savedJobs: many(jobSavedByCreator),
  endorsements: many(endorsements),
  profileViews: many(profileViews)
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  members: many(brandMembers),
  jobs: many(jobs),
  subscriptions: many(subscriptions)
}));

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Creator = InferSelectModel<typeof creators>;
export type NewCreator = InferInsertModel<typeof creators>;
export type Brand = InferSelectModel<typeof brands>;
export type NewBrand = InferInsertModel<typeof brands>;
export type BrandMember = InferSelectModel<typeof brandMembers>;
export type NewBrandMember = InferInsertModel<typeof brandMembers>;
export type Job = InferSelectModel<typeof jobs>;
export type NewJob = InferInsertModel<typeof jobs>;
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;
export type Embedding = InferSelectModel<typeof embeddings>;
export type NewEmbedding = InferInsertModel<typeof embeddings>;
