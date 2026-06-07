import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, BriefcaseBusiness, Building2, Globe, MapPin, MessageCircle, Radio, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buildSeedData } from "@/lib/db/seed";
import { createTRPCServerCaller } from "@/lib/trpc/server";

type CompanyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type BrandProfileData = Awaited<ReturnType<Awaited<ReturnType<typeof createTRPCServerCaller>>["brand"]["profile"]>>;

export default async function CompanyPublicPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const profile = await getBrandProfile(slug);

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <header className="sticky top-0 z-40 border-b border-[#e9e9e7] bg-white/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-4">
          <Link
            className="logoMark miniLogo ring-border shrink-0 bg-white/5 ring-1"
            href="/feed"
            aria-label="Terrace feed"
          >
            <span />
            <span />
            <span />
          </Link>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#9b9a97] uppercase">Terrace</p>
            <p className="hidden text-sm text-[#787774] sm:block">Brand company page</p>
          </div>
          <nav className="ml-auto flex items-center gap-2">
            <Link
              className="rounded-full px-3 py-2 text-sm font-medium text-[#787774] transition hover:bg-[#f7f7f5] hover:text-[#37352f]"
              href="/search"
            >
              Search
            </Link>
            <Link
              className="rounded-full bg-[#37352f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#262420]"
              href="/messages"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1180px] gap-6 px-5 py-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="grid gap-6">
          <article className="overflow-hidden rounded-[28px] border border-[#e9e9e7] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.05)]">
            <div className="h-56 bg-[linear-gradient(135deg,rgba(159,201,228,0.55),rgba(226,138,119,0.28)),url('https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
            <div className="p-6 pt-0">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div className="flex items-end gap-5">
                  <BrandAvatar name={profile.brand.name} className="-mt-12 h-28 w-28 border-4 border-white text-3xl" />
                  <div className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-4xl font-semibold tracking-[-0.05em]">{profile.brand.name}</h1>
                      {profile.brand.verified && <BadgeCheck className="h-6 w-6 text-[#78bde8]" />}
                    </div>
                    <p className="mt-2 text-sm text-[#787774]">/{profile.brand.slug}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.brand.verified && (
                    <Badge className="rounded-full border border-[#d6eaf8] bg-[#edf8ff] px-3 py-1 text-[#2f83b7] hover:bg-[#edf8ff]">
                      Verified brand
                    </Badge>
                  )}
                  <Badge className="rounded-full border border-[#bfe8d0] bg-[#e8f8ef] px-3 py-1 text-[#147a3b] hover:bg-[#e8f8ef]">
                    <Radio className="mr-2 h-3.5 w-3.5" />
                    Hiring creators
                  </Badge>
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-lg leading-8 font-semibold text-[#252932]">
                {profile.brand.tagline ?? "Building measurable creator partnerships"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#787774]">
                {profile.brand.industry && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {profile.brand.industry}
                  </span>
                )}
                {profile.brand.hqLocation && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile.brand.hqLocation}
                  </span>
                )}
                {profile.brand.websiteUrl && (
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    Website
                  </span>
                )}
              </div>
              {profile.brand.about && (
                <p className="mt-6 max-w-4xl text-sm leading-7 text-[#787774]">{profile.brand.about}</p>
              )}

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <CompanyMetric icon={Users} label="Followers" value={formatNumber(profile.brand.followerCount)} />
                <CompanyMetric
                  icon={BriefcaseBusiness}
                  label="Open jobs"
                  value={String(profile.jobs.length)}
                  highlighted
                />
                <CompanyMetric icon={MessageCircle} label="Public posts" value={String(profile.posts.length)} />
                <CompanyMetric icon={Building2} label="Team" value={String(profile.team.length)} />
              </div>
            </div>
          </article>

          <section className="grid gap-4">
            <SectionHeader eyebrow="Active Briefs" title="Creator jobs this brand is hiring for." />
            <div className="grid gap-3">
              {profile.jobs.length === 0 && (
                <EmptyPanel title="No open jobs" body="This brand has no public briefs open right now." />
              )}
              {profile.jobs.map((job) => (
                <article
                  className="grid gap-4 rounded-[22px] border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)] md:grid-cols-[minmax(0,1fr)_auto]"
                  key={job.id}
                >
                  <div>
                    <Badge className="rounded-full border border-[#f3d5c4] bg-[#faf0ea] text-[#D86B3D] hover:bg-[#faf0ea]">
                      {job.remote ? "Remote" : "Location-based"}
                    </Badge>
                    <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em]">{job.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#787774]">{job.description}</p>
                  </div>
                  <div className="grid gap-2 md:min-w-48">
                    <span className="rounded-full border border-[#f3d5c4] bg-[#faf0ea] px-3 py-2 text-sm font-semibold text-[#D86B3D]">
                      {formatBudget(job.budgetMinCents, job.budgetMaxCents)}
                    </span>
                    <span className="rounded-full border border-[#e9e9e7] bg-[#f8f9fb] px-3 py-2 text-sm text-[#787774]">
                      {job.applicationCount} applicants
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4">
            <SectionHeader eyebrow="Brand Feed" title="Recent public updates." />
            <div className="grid gap-3">
              {profile.posts.length === 0 && (
                <EmptyPanel title="No posts yet" body="Brand updates and creator shoutouts will appear here." />
              )}
              {profile.posts.map((post) => (
                <article
                  className="rounded-[22px] border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]"
                  key={post.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border border-[#f3d5c4] bg-[#faf0ea] text-[#D86B3D] hover:bg-[#faf0ea]">
                      {post.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs font-semibold text-[#9b9a97]">{formatDate(post.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#787774]">{post.body}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <article className="rounded-[22px] border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
            <SectionHeader eyebrow="Team" title="Public members" />
            <div className="mt-5 grid gap-3">
              {profile.team.map(({ member, user }) => (
                <div
                  className="flex items-center gap-3 rounded-2xl border border-[#e9e9e7] bg-[#fbfbfa] p-3"
                  key={user.id}
                >
                  <BrandAvatar name={user.email} className="h-10 w-10 text-sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.email}</p>
                    <p className="text-xs text-[#787774] capitalize">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[22px] border border-[#f3d5c4] bg-[#faf0ea] p-5">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-[#D86B3D]" />
              <SectionHeader eyebrow="Brand action" title="Pitch this team" />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#7a513f]">
              Terrace company pages collect brand credibility, hiring intent, public briefs, and creator-facing updates.
            </p>
            <Link
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#37352f] text-sm font-semibold text-white transition hover:bg-[#262420]"
              href="/messages"
            >
              Start conversation
            </Link>
          </article>
        </aside>
      </section>
    </main>
  );
}

async function getBrandProfile(slug: string) {
  try {
    const caller = await createTRPCServerCaller();
    return (await caller.brand.profile({ slug })) ?? getSeedBrandProfile(slug);
  } catch {
    return getSeedBrandProfile(slug);
  }
}

function getSeedBrandProfile(slug: string): BrandProfileData {
  const seed = buildSeedData();
  const brand = seed.brands.find((row) => row.slug === slug.toLowerCase());
  if (!brand) return null;

  const team = seed.brandMembers
    .filter((member) => member.brandId === brand.id)
    .map((member) => {
      const user = seed.users.find((row) => row.id === member.userId);
      if (!user) return null;

      return {
        member: {
          brandId: member.brandId,
          userId: member.userId,
          role: member.role ?? "viewer",
          invitedBy: member.invitedBy ?? null,
          joinedAt: member.joinedAt ?? new Date("2026-04-01T00:00:00.000Z")
        },
        user: {
          id: user.id!,
          clerkId: user.clerkId,
          email: user.email,
          type: user.type,
          onboardedAt: user.onboardedAt ?? null,
          suspendedAt: null,
          suspendedReason: null,
          createdAt: user.createdAt ?? new Date("2026-04-01T00:00:00.000Z")
        }
      };
    })
    .filter((row) => row !== null);

  const brandPosts = seed.posts
    .filter((post) => post.authorType === "brand" && post.authorId === brand.id)
    .slice(0, 12)
    .map((post) => ({
      id: post.id!,
      authorType: post.authorType!,
      authorId: post.authorId,
      body: post.body,
      mediaJson: post.mediaJson ?? [],
      type: post.type ?? "update",
      visibility: post.visibility ?? "public",
      source: post.source ?? "terrace",
      externalUrl: post.externalUrl ?? null,
      externalId: post.externalId ?? null,
      createdAt: post.createdAt ?? new Date("2026-04-28T00:00:00.000Z"),
      updatedAt: post.updatedAt ?? new Date("2026-04-28T00:00:00.000Z")
    }));

  return {
    brand: {
      id: brand.id!,
      slug: brand.slug,
      name: brand.name,
      tagline: brand.tagline ?? null,
      about: brand.about ?? null,
      websiteUrl: brand.websiteUrl ?? null,
      logoUrl: brand.logoUrl ?? null,
      coverUrl: brand.coverUrl ?? null,
      industry: brand.industry ?? null,
      sizeRange: brand.sizeRange ?? null,
      hqLocation: brand.hqLocation ?? null,
      verified: brand.verified ?? false,
      followerCount: brand.followerCount ?? 0,
      createdAt: brand.createdAt ?? new Date("2026-04-01T00:00:00.000Z"),
      updatedAt: brand.updatedAt ?? new Date("2026-04-01T00:00:00.000Z")
    },
    team,
    posts: brandPosts,
    jobs: []
  };
}

function BrandAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={`bg-[linear-gradient(135deg,#9fc9e4,#e28a77)] font-semibold text-[#37352f] ${className ?? ""}`}>
      <AvatarFallback className="bg-transparent text-[#37352f]">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}

function CompanyMetric({
  icon: Icon,
  label,
  value,
  highlighted = false
}: {
  icon: typeof Users;
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${highlighted ? "border-[#f3d5c4] bg-[#faf0ea]" : "border-[#e9e9e7] bg-[#fbfbfa]"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-[#9b9a97] uppercase">{label}</span>
        <Icon className={`h-4 w-4 ${highlighted ? "text-[#D86B3D]" : "text-[#9b9a97]"}`} />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-[#e9e9e7] bg-white p-5">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[#787774]">{body}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-[22px] leading-tight font-semibold tracking-[-0.04em] text-[#37352f]">{title}</h2>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/[@\s.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return value.toLocaleString();
}

function formatBudget(min?: number | null, max?: number | null) {
  if (!min && !max) return "Budget TBD";
  if (min && max) return `$${formatNumber(min / 100)}-${formatNumber(max / 100)}`;
  return `$${formatNumber((min ?? max ?? 0) / 100)}+`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}
