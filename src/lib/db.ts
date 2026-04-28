import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { campaigns, conversations, influencers, type Campaign, type Influencer } from "@/data/marketplace";

type SqlValue = string | number | null;

const dataDir = path.join(process.cwd(), "data");
const dbPath = process.env.INFLUENCERLINK_DB_PATH ?? path.join(dataDir, "influencerlink.sqlite");

type DbGlobal = typeof globalThis & {
  influencerLinkDb?: DatabaseSync;
};

function getConnection() {
  if (!(globalThis as DbGlobal).influencerLinkDb) {
    fs.mkdirSync(dataDir, { recursive: true });
    const db = new DatabaseSync(dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    (globalThis as DbGlobal).influencerLinkDb = db;
    initDatabase(db);
  }

  return (globalThis as DbGlobal).influencerLinkDb!;
}

function initDatabase(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      account_type TEXT NOT NULL CHECK(account_type IN ('creator', 'brand', 'agency', 'manager')),
      verification_status TEXT NOT NULL DEFAULT 'unverified',
      subscription_tier TEXT NOT NULL DEFAULT 'free',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS creator_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      handle TEXT NOT NULL,
      city TEXT NOT NULL,
      niche TEXT NOT NULL,
      platforms_json TEXT NOT NULL,
      followers INTEGER NOT NULL,
      avg_views INTEGER NOT NULL,
      engagement_rate REAL NOT NULL,
      audience TEXT NOT NULL,
      rate INTEGER NOT NULL,
      availability TEXT NOT NULL,
      brand_safety INTEGER NOT NULL,
      response_time TEXT NOT NULL,
      verified INTEGER NOT NULL,
      past_brands_json TEXT NOT NULL,
      bio TEXT NOT NULL,
      languages_json TEXT NOT NULL,
      content_types_json TEXT NOT NULL,
      total_reach INTEGER NOT NULL,
      campaigns_completed INTEGER NOT NULL,
      audience_demographics_json TEXT NOT NULL,
      social_accounts_json TEXT NOT NULL,
      content_samples_json TEXT NOT NULL,
      collaborations_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS brand_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      industry TEXT NOT NULL,
      website TEXT,
      target_audiences_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      title TEXT NOT NULL,
      goal TEXT NOT NULL,
      budget INTEGER NOT NULL,
      budget_range TEXT NOT NULL,
      niche TEXT NOT NULL,
      audience TEXT NOT NULL,
      timeline TEXT NOT NULL,
      deliverables_json TEXT NOT NULL,
      requirements_json TEXT NOT NULL,
      distribution TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      creator_id TEXT NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
      pitch TEXT NOT NULL,
      proposed_terms_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      influencer_id TEXT NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
      brand TEXT NOT NULL,
      subject TEXT NOT NULL,
      budget INTEGER NOT NULL,
      status TEXT NOT NULL,
      last_message TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL,
      body TEXT NOT NULL,
      read_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT,
      event_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      metadata_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const seeded = db.prepare("SELECT COUNT(*) AS count FROM creator_profiles").get() as { count: number };
  if (seeded.count === 0) seedDatabase(db);
}

function seedDatabase(db: DatabaseSync) {
  const now = new Date().toISOString();

  const insertCreator = db.prepare(`
    INSERT INTO creator_profiles (
      id, user_id, name, handle, city, niche, platforms_json, followers, avg_views, engagement_rate,
      audience, rate, availability, brand_safety, response_time, verified, past_brands_json, bio,
      languages_json, content_types_json, total_reach, campaigns_completed, audience_demographics_json,
      social_accounts_json, content_samples_json, collaborations_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const creator of influencers) {
    insertCreator.run(
      creator.id,
      null,
      creator.name,
      creator.handle,
      creator.city,
      creator.niche,
      JSON.stringify(creator.platforms),
      creator.followers,
      creator.avgViews,
      creator.engagementRate,
      creator.audience,
      creator.rate,
      creator.availability,
      creator.brandSafety,
      creator.responseTime,
      creator.verified ? 1 : 0,
      JSON.stringify(creator.pastBrands),
      creator.bio,
      JSON.stringify(creator.languages),
      JSON.stringify(creator.contentTypes),
      creator.totalReach,
      creator.campaignsCompleted,
      JSON.stringify(creator.audienceDemographics),
      JSON.stringify(creator.socialAccounts),
      JSON.stringify(creator.contentSamples),
      JSON.stringify(creator.collaborations),
      now
    );
  }

  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (
      id, brand, title, goal, budget, budget_range, niche, audience, timeline,
      deliverables_json, requirements_json, distribution, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const campaign of campaigns) {
    insertCampaign.run(
      campaign.id,
      campaign.brand,
      campaign.title,
      campaign.goal,
      campaign.budget,
      campaign.budgetRange,
      campaign.niche,
      campaign.audience,
      campaign.timeline,
      JSON.stringify(campaign.deliverables),
      JSON.stringify(campaign.requirements),
      campaign.distribution,
      campaign.status,
      now
    );
  }

  const insertConversation = db.prepare(`
    INSERT INTO conversations (id, influencer_id, brand, subject, budget, status, last_message, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMessage = db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_type, body, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const conversation of conversations) {
    insertConversation.run(
      conversation.id,
      conversation.influencerId,
      conversation.brand,
      conversation.subject,
      conversation.budget,
      conversation.status,
      conversation.lastMessage,
      now
    );
    insertMessage.run(id("msg"), conversation.id, "brand", conversation.lastMessage, now);
  }
}

export function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`;
}

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function creatorFromRow(row: Record<string, unknown>): Influencer {
  return {
    id: String(row.id),
    name: String(row.name),
    handle: String(row.handle),
    city: String(row.city),
    niche: String(row.niche),
    platforms: parseJson(String(row.platforms_json)),
    followers: Number(row.followers),
    avgViews: Number(row.avg_views),
    engagementRate: Number(row.engagement_rate),
    audience: String(row.audience),
    rate: Number(row.rate),
    availability: row.availability as Influencer["availability"],
    brandSafety: Number(row.brand_safety),
    responseTime: String(row.response_time),
    verified: Boolean(row.verified),
    pastBrands: parseJson(String(row.past_brands_json)),
    bio: String(row.bio),
    languages: parseJson(String(row.languages_json)),
    contentTypes: parseJson(String(row.content_types_json)),
    totalReach: Number(row.total_reach),
    campaignsCompleted: Number(row.campaigns_completed),
    audienceDemographics: parseJson(String(row.audience_demographics_json)),
    socialAccounts: parseJson(String(row.social_accounts_json)),
    contentSamples: parseJson(String(row.content_samples_json)),
    collaborations: parseJson(String(row.collaborations_json))
  };
}

function campaignFromRow(row: Record<string, unknown>): Campaign {
  return {
    id: String(row.id),
    brand: String(row.brand),
    title: String(row.title),
    goal: String(row.goal),
    budget: Number(row.budget),
    budgetRange: String(row.budget_range),
    niche: String(row.niche),
    audience: String(row.audience),
    timeline: String(row.timeline),
    deliverables: parseJson(String(row.deliverables_json)),
    requirements: parseJson(String(row.requirements_json)),
    distribution: row.distribution as Campaign["distribution"],
    status: row.status as Campaign["status"]
  };
}

export const db = {
  raw() {
    return getConnection();
  },

  listCreators(filters?: { q?: string; niche?: string; maxRate?: number }) {
    const clauses: string[] = [];
    const params: SqlValue[] = [];

    if (filters?.q) {
      clauses.push("(LOWER(name || ' ' || handle || ' ' || niche || ' ' || city || ' ' || audience) LIKE ?)");
      params.push(`%${filters.q.toLowerCase()}%`);
    }
    if (filters?.niche && filters.niche !== "All") {
      clauses.push("niche = ?");
      params.push(filters.niche);
    }
    if (filters?.maxRate) {
      clauses.push("rate <= ?");
      params.push(filters.maxRate);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = getConnection()
      .prepare(`SELECT * FROM creator_profiles ${where} ORDER BY verified DESC, total_reach DESC`)
      .all(...params);
    return rows.map((row) => creatorFromRow(row as Record<string, unknown>));
  },

  getCreator(idValue: string) {
    const row = getConnection().prepare("SELECT * FROM creator_profiles WHERE id = ?").get(idValue);
    return row ? creatorFromRow(row as Record<string, unknown>) : null;
  },

  listCampaigns() {
    const rows = getConnection().prepare("SELECT * FROM campaigns ORDER BY created_at DESC").all();
    return rows.map((row) => campaignFromRow(row as Record<string, unknown>));
  },

  getCampaign(idValue: string) {
    const row = getConnection().prepare("SELECT * FROM campaigns WHERE id = ?").get(idValue);
    return row ? campaignFromRow(row as Record<string, unknown>) : null;
  },

  listConversations(creatorId?: string) {
    const rows = creatorId
      ? getConnection()
          .prepare("SELECT * FROM conversations WHERE influencer_id = ? ORDER BY updated_at DESC")
          .all(creatorId)
      : getConnection().prepare("SELECT * FROM conversations ORDER BY updated_at DESC").all();
    return rows.map((row) => ({
      id: String((row as Record<string, unknown>).id),
      influencerId: String((row as Record<string, unknown>).influencer_id),
      brand: String((row as Record<string, unknown>).brand),
      subject: String((row as Record<string, unknown>).subject),
      budget: Number((row as Record<string, unknown>).budget),
      status: (row as Record<string, unknown>).status,
      lastMessage: String((row as Record<string, unknown>).last_message)
    }));
  },

  createUser(input: { email: string; name: string; accountType: "creator" | "brand" | "agency" | "manager" }) {
    const userId = id("user");
    const now = new Date().toISOString();
    getConnection()
      .prepare(
        "INSERT INTO users (id, email, name, account_type, verification_status, subscription_tier, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(userId, input.email.toLowerCase(), input.name, input.accountType, "verified", "free", now);
    return this.getUserById(userId)!;
  },

  getUserByEmail(email: string) {
    const row = getConnection().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
    return row ? userFromRow(row as Record<string, unknown>) : null;
  },

  getUserById(idValue: string) {
    const row = getConnection().prepare("SELECT * FROM users WHERE id = ?").get(idValue);
    return row ? userFromRow(row as Record<string, unknown>) : null;
  },

  createSession(userId: string) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const now = new Date();
    const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);
    getConnection()
      .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
      .run(tokenHash, userId, expires.toISOString(), now.toISOString());
    return { token, expiresAt: expires };
  },

  getUserBySession(token: string) {
    const row = getConnection()
      .prepare(
        "SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?"
      )
      .get(hashToken(token), new Date().toISOString());
    return row ? userFromRow(row as Record<string, unknown>) : null;
  },

  deleteSession(token: string) {
    getConnection().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  },

  createContactMessage(input: { fullName: string; email: string; company?: string; message: string }) {
    const messageId = id("contact");
    getConnection()
      .prepare(
        "INSERT INTO contact_messages (id, full_name, email, company, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        messageId,
        input.fullName,
        input.email.toLowerCase(),
        input.company ?? null,
        input.message,
        "new",
        new Date().toISOString()
      );
    return { id: messageId, status: "new" };
  },

  createApplication(input: {
    campaignId: string;
    creatorId: string;
    pitch: string;
    proposedTerms?: Record<string, unknown>;
  }) {
    const applicationId = id("app");
    getConnection()
      .prepare(
        "INSERT INTO applications (id, campaign_id, creator_id, pitch, proposed_terms_json, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        applicationId,
        input.campaignId,
        input.creatorId,
        input.pitch,
        JSON.stringify(input.proposedTerms ?? {}),
        "pending",
        new Date().toISOString()
      );
    return { id: applicationId, status: "pending" };
  },

  metrics() {
    const conn = getConnection();
    const creatorCount = (conn.prepare("SELECT COUNT(*) AS count FROM creator_profiles").get() as { count: number })
      .count;
    const campaignCount = (conn.prepare("SELECT COUNT(*) AS count FROM campaigns").get() as { count: number }).count;
    const applicationCount = (conn.prepare("SELECT COUNT(*) AS count FROM applications").get() as { count: number })
      .count;
    const contactCount = (conn.prepare("SELECT COUNT(*) AS count FROM contact_messages").get() as { count: number })
      .count;
    return { creatorCount, campaignCount, applicationCount, contactCount };
  }
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function userFromRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    accountType: String(row.account_type),
    verificationStatus: String(row.verification_status),
    subscriptionTier: String(row.subscription_tier),
    createdAt: String(row.created_at)
  };
}
