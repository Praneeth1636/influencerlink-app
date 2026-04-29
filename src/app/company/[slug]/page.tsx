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
    <main className="min-h-screen bg-[#080809] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(216,90,48,0.18),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(168,85,247,0.12),transparent_26%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] bg-[size:56px_56px] opacity-35" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080809]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-4">
          <Link
            className="logoMark miniLogo shrink-0 bg-white/5 ring-1 ring-white/10"
            href="/feed"
            aria-label="CreatorLink feed"
          >
            <span />
            <span />
            <span />
          </Link>
          <div>
            <p className="text-[11px] font-black tracking-[0.24em] text-white/38 uppercase">CreatorLink</p>
            <p className="hidden text-sm text-white/60 sm:block">Brand company page</p>
          </div>
          <nav className="ml-auto flex items-center gap-2">
            <Link
              className="rounded-xl px-3 py-2 text-sm font-bold text-white/58 transition hover:bg-white/[0.06] hover:text-white"
              href="/search"
            >
              Search
            </Link>
            <Link
              className="rounded-xl bg-[#D85A30] px-4 py-2 text-sm font-black text-white transition hover:bg-[#c54f29]"
              href="/messages"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1180px] gap-6 px-5 py-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="grid gap-6">
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/10">
            <div className="h-56 bg-[linear-gradient(135deg,rgba(216,90,48,0.44),rgba(168,85,247,0.22)),url('https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
            <div className="p-6 pt-0">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div className="flex items-end gap-5">
                  <BrandAvatar
                    name={profile.brand.name}
                    className="-mt-12 h-28 w-28 border-4 border-[#101013] text-3xl"
                  />
                  <div className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-4xl font-black tracking-[-0.05em]">{profile.brand.name}</h1>
                      {profile.brand.verified && <BadgeCheck className="h-6 w-6 text-[#ffb49c]" />}
                    </div>
                    <p className="mt-2 text-sm text-white/50">/{profile.brand.slug}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.brand.verified && (
                    <Badge className="rounded-full bg-[#D85A30]/12 px-3 py-1 text-[#ffb49c] hover:bg-[#D85A30]/12">
                      Verified brand
                    </Badge>
                  )}
                  <Badge className="rounded-full bg-emerald-300/12 px-3 py-1 text-emerald-100 hover:bg-emerald-300/12">
                    <Radio className="mr-2 h-3.5 w-3.5" />
                    Hiring creators
                  </Badge>
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-lg leading-8 font-bold text-white/82">
                {profile.brand.tagline ?? "Building measurable creator partnerships"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/48">
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
                <p className="mt-6 max-w-4xl text-sm leading-7 text-white/58">{profile.brand.about}</p>
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
                  className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5 md:grid-cols-[minmax(0,1fr)_auto]"
                  key={job.id}
                >
                  <div>
                    <Badge className="rounded-full bg-[#D85A30]/12 text-[#ffb49c] hover:bg-[#D85A30]/12">
                      {job.remote ? "Remote" : "Location-based"}
                    </Badge>
                    <h2 className="mt-4 text-xl font-black tracking-[-0.04em]">{job.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/55">{job.description}</p>
                  </div>
                  <div className="grid gap-2 md:min-w-48">
                    <span className="rounded-xl border border-[#D85A30]/20 bg-[#D85A30]/10 px-3 py-2 text-sm font-black text-[#ffb49c]">
                      {formatBudget(job.budgetMinCents, job.budgetMaxCents)}
                    </span>
                    <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/52">
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
                <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5" key={post.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-[#D85A30]/12 text-[#ffb49c] hover:bg-[#D85A30]/12">
                      {post.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs font-bold text-white/35">{formatDate(post.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/64">{post.body}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <SectionHeader eyebrow="Team" title="Public members" />
            <div className="mt-5 grid gap-3">
              {profile.team.map(({ member, user }) => (
                <div
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
                  key={user.id}
                >
                  <BrandAvatar name={user.email} className="h-10 w-10 text-sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{user.email}</p>
                    <p className="text-xs text-white/38 capitalize">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#D85A30]/18 bg-[#D85A30]/8 p-5">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-[#ffb49c]" />
              <SectionHeader eyebrow="Brand action" title="Pitch this team" />
            </div>
            <p className="mt-4 text-sm leading-6 text-white/58">
              CreatorLink company pages collect brand credibility, hiring intent, public briefs, and creator-facing
              updates.
            </p>
            <Link
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#D85A30] text-sm font-black text-white transition hover:bg-[#c54f29]"
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
    return await caller.brand.profile({ slug });
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
    <Avatar
      className={`bg-gradient-to-br from-[#D85A30] via-[#f1a06d] to-purple-300 font-black text-black ${className ?? ""}`}
    >
      <AvatarFallback className="bg-transparent text-black">{initials(name)}</AvatarFallback>
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
      className={`rounded-2xl border p-4 ${highlighted ? "border-[#D85A30]/45 bg-[#D85A30]/10" : "border-white/10 bg-white/[0.04]"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black tracking-[0.16em] text-white/35 uppercase">{label}</span>
        <Icon className={`h-4 w-4 ${highlighted ? "text-[#ffb49c]" : "text-white/34"}`} />
      </div>
      <p className="mt-3 text-2xl font-black tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm font-black">{title}</p>
      <p className="mt-1 text-xs leading-5 text-white/48">{body}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-[22px] leading-tight font-black tracking-[-0.04em] text-white">{title}</h2>
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
