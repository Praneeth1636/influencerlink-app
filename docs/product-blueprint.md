# InfluencerLink Product Blueprint

InfluencerLink is a professional network and marketplace for creator-brand partnerships. The MVP centers on three screens: verified creator profiles, AI-ranked creator discovery, and an active campaign workspace.

## Core Screens

1. Creator profile
   - Verified identity, niche, location, availability, response time.
   - Total reach, engagement, completed campaigns, average rate.
   - Connected social accounts with synced metrics.
   - Past brand collaborations and audience demographics.
   - AI profile and pricing helpers.

2. Brand discovery
   - Search by niche, creator name, audience, platform, and keyword.
   - Filters for niche, geography, follower/rate range, and campaign fit.
   - AI match score for each creator.
   - Shortlist and outreach draft helpers.

3. Campaign workspace
   - Budget, deliverable progress, deadline, campaign status.
   - Deliverable tracker with approved, revision, in-progress, and pending states.
   - Collaboration chat, content submission, negotiation guidance, and message drafts.

## Architecture Direction

Client apps share one API surface:
- Web app: Next.js or React.
- iOS: Swift.
- Android: Kotlin.

Backend domains:
- Identity and access control.
- Creator and brand profiles.
- Social platform integrations.
- Search and discovery.
- Campaigns and applications.
- Messaging and notifications.
- Contracts, escrow, and payments.
- Analytics and moderation.

Data layer:
- PostgreSQL for transactional records.
- Elasticsearch for creator discovery.
- Redis for cache, queues, and presence.
- BigQuery or Snowflake for analytics.
- S3-compatible storage for media uploads.

Real-time:
- WebSockets through Pusher, Socket.io, or a dedicated realtime service.

Social ingestion:
- Platform adapters for Instagram Graph API, TikTok Business API, YouTube Data API, and other networks.
- Queue-based sync jobs that respect rate limits and normalize metrics into creator profiles and search indexes.

## Core Data Model

- User: root account record with email, account type, verification status, subscription tier.
- CreatorProfile: bio, niches, location, languages, content type, rate card, availability, aggregate stats.
- BrandProfile: company, industry, website, size, target audience, verification documents.
- SocialAccount: external account link, tokens, follower count, engagement rate, last sync time.
- Campaign: title, brief, budget, timeline, requirements, deliverables, status.
- Application: creator pitch, status, proposed terms.
- Collaboration: active project, deliverable statuses, approvals, submissions.
- Contract: terms, versions, signatures.
- Payment: escrow deposit, milestone release, payout status, Stripe IDs.
- Conversation and Message: collaboration messaging with read receipts and attachments.
- Review: two-sided post-campaign reputation.
- ContentSample: imported creator posts and performance metrics.

## Go-To-Market

Phase 1: dominate a niche beachhead, starting with beauty creators in the 10K-500K follower range. Recruit 50-100 creators manually, onboard 5-10 beauty brands, and focus on verified profiles, search, and campaign management.

Phase 2: expand into adjacent niches such as fashion, lifestyle, and fitness once beauty has repeatable campaign volume.

Phase 3: broaden into tech, finance, gaming, food, travel, and parenting, then expand internationally.

## Pricing Direction

- Creator free: basic profile and limited applications.
- Creator pro: advanced analytics, unlimited applications, AI pitch help, priority placement.
- Brand free: limited monthly searches.
- Brand starter: unlimited search and limited active campaigns.
- Brand growth: unlimited campaigns, team seats, AI matching.
- Transaction fee: 5-8% take rate on completed campaigns through escrow.

## Campaign Marketplace Flow

1. Brand posts campaign using a template.
2. Creator requirements and budget are structured.
3. Campaign is public, invite-only, or hybrid.
4. Creators discover, quick apply, or submit custom pitches.
5. Brands compare applicants by match score, rate, stats, pitch quality, and response time.
6. Negotiation produces structured agreed terms.
7. Contract is generated and signed.
8. Brand funds escrow.
9. Collaboration workspace tracks deliverables, content reviews, revisions, posting, and performance.
10. Escrow releases by milestone.
11. Both sides review each other and verified campaign data enriches the creator profile.
