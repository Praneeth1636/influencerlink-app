"use client";

import { useState } from "react";
import { ArrowUpRight, BadgeCheck, Bookmark, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { SocialButton } from "@/components/ui/social-button";
import { cn } from "@/lib/utils";

export type TerraceFeedBrief = {
  title: string;
  description: string;
  meta: string[];
};

export type TerraceFeedReply = {
  authorName: string;
  authorHandle: string;
  avatarFallback: string;
  content: string;
  timestamp: string;
  verified?: boolean;
};

export type TerraceFeedSocial = {
  source: "instagram" | "tiktok" | "youtube";
  externalUrl: string;
  mediaType: string;
  title: string | null;
  thumbnailUrl?: string;
  stats: { views?: number; likes?: number; comments?: number };
};

export type TerraceFeedCardProps = {
  authorName: string;
  authorHandle: string;
  authorMeta: string;
  avatarFallback: string;
  content: string[];
  timestamp: string;
  label: string;
  metric: string;
  accent?: string;
  imageUrl?: string;
  brief?: TerraceFeedBrief;
  reply?: TerraceFeedReply;
  social?: TerraceFeedSocial;
  verified?: boolean;
  className?: string;
  onAuthorClick?: () => void;
};

export function TerraceFeedCard({
  authorName,
  authorHandle,
  authorMeta,
  avatarFallback,
  content,
  timestamp,
  label,
  metric,
  accent = "#e08550",
  imageUrl,
  brief,
  reply,
  social,
  verified = false,
  className,
  onAuthorClick
}: TerraceFeedCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [reposted, setReposted] = useState(false);
  const [interactionMessage, setInteractionMessage] = useState<string | null>(null);

  function note(message: string) {
    setInteractionMessage(message);
    window.setTimeout(() => setInteractionMessage(null), 1800);
  }

  return (
    <article className={cn("relative", className)}>
      <div className="relative">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0 bg-[linear-gradient(135deg,#f1faff,#fff3ec)] text-[11px] font-semibold text-[#e08550] sm:h-11 sm:w-11 sm:text-xs">
              <AvatarFallback className="bg-transparent text-[#e08550]">{avatarFallback}</AvatarFallback>
              <AvatarBadge className="bg-emerald-400" />
            </Avatar>
            <div className="min-w-0">
              <button
                className="inline-flex max-w-full items-center gap-1.5 text-left text-sm font-semibold tracking-[-0.02em] text-[#1d1d1f] hover:underline sm:text-[15px]"
                onClick={onAuthorClick}
                type="button"
              >
                <span className="truncate">{authorName}</span>
                {verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#8CC9E8]" />}
              </button>
              <p className="mt-0.5 truncate text-[13px] text-[#9b9a97]">
                @{authorHandle} · {authorMeta} · {timestamp}
              </p>
            </div>
          </div>

          <span className="shrink-0 pt-1 text-[11px] font-semibold tracking-[0.04em]" style={{ color: accent }}>
            {label}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 sm:mt-4">
          {content.map((item) => (
            <p className="text-sm leading-6 text-[#34383f] sm:text-[15px] sm:leading-7" key={item}>
              {item}
            </p>
          ))}
        </div>

        {imageUrl && !social && (
          <button
            className="mt-3 block w-full overflow-hidden rounded-2xl bg-[#f7f7f5] text-left sm:mt-4"
            onClick={onAuthorClick}
            type="button"
          >
            <div
              className="aspect-[16/10] bg-cover bg-center transition duration-500 hover:scale-[1.015]"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          </button>
        )}

        {social && <SocialEmbed social={social} />}

        {brief && (
          <div className="mt-3 rounded-2xl border border-[#f1f1ef] bg-[#fbfbfa] p-4 sm:mt-4">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#e08550] uppercase">Hiring brief</p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-[#37352f]">{brief.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#787774]">{brief.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {brief.meta.map((item) => (
                <span
                  className="rounded-full border border-[#f1f1ef] bg-white px-3 py-1 text-xs font-medium text-[#787774]"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {reply && (
          <div className="mt-3 rounded-2xl bg-[#fbfbfa] p-4 sm:mt-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 shrink-0 bg-[#f0f7fb] text-xs font-semibold text-[#243447]">
                <AvatarFallback className="bg-transparent">{reply.avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1 text-sm">
                  <span className="font-semibold text-[#37352f]">{reply.authorName}</span>
                  {reply.verified && <BadgeCheck className="h-3.5 w-3.5 text-[#e08550]" />}
                  <span className="text-[#787774]">@{reply.authorHandle}</span>
                  <span className="text-[#787774]">·</span>
                  <span className="text-[#787774]">{reply.timestamp}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[#667085]">{reply.content}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 flex items-center sm:mt-2.5">
          <div className="-ml-2 flex items-center gap-0.5 text-[#37352f]">
            <LikeAction
              liked={liked}
              onClick={() => {
                setLiked((current) => !current);
              }}
            />
            <IconAction
              active={replyOpen}
              activeClassName="bg-[#eef6fb] text-[#2f83b7]"
              icon={MessageCircle}
              label="Reply"
              onClick={() => {
                setInteractionMessage(null);
                setReplyOpen((current) => !current);
              }}
            />
            <IconAction
              active={reposted}
              activeClassName="bg-[#e9f7ef] text-emerald-600"
              icon={Repeat2}
              label={reposted ? "Reposted" : "Repost"}
              onClick={() => {
                setReposted((current) => !current);
                note(reposted ? "Repost removed." : "Repost added to your feed.");
              }}
            />
            <SocialButton />
          </div>
          <div className="-mr-2 ml-auto">
            <IconAction
              active={saved}
              activeClassName="bg-[#faf0ea] text-[#e08550]"
              fillWhenActive
              icon={Bookmark}
              label={saved ? "Saved" : "Save"}
              onClick={() => {
                setSaved((current) => !current);
              }}
            />
          </div>
        </div>
        <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#37352f]">{metric}</p>
        {interactionMessage ? (
          <p className="creatorlink-reveal mt-3 text-xs font-medium text-[#787774]">{interactionMessage}</p>
        ) : null}
        {replyOpen ? (
          <form
            className="creatorlink-reveal mt-3 flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!replyText.trim()) {
                note("Write a reply first.");
                return;
              }
              note("Reply saved in this demo feed.");
              setReplyText("");
              setReplyOpen(false);
            }}
          >
            <input
              className="h-10 min-w-0 flex-1 rounded-full border border-[#f1f1ef] bg-[#fbfbfa] px-4 text-sm text-[#37352f] outline-none placeholder:text-[#9b9a97] focus:border-[#9dcfe5] focus:bg-white"
              onChange={(event) => setReplyText(event.target.value)}
              placeholder={`Reply to ${authorName}...`}
              value={replyText}
            />
            <button
              className="h-10 rounded-full bg-[#37352f] px-4 text-sm font-semibold text-white transition hover:bg-[#262420]"
              type="submit"
            >
              Send
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}

type GlyphProps = { className?: string; style?: React.CSSProperties };

function InstagramGlyph({ className, style }: GlyphProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5.4" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeGlyph({ className, style }: GlyphProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.58 7.19a2.73 2.73 0 0 0-1.92-1.93C17.96 4.8 12 4.8 12 4.8s-5.96 0-7.66.46A2.73 2.73 0 0 0 2.42 7.19 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .42 4.81 2.73 2.73 0 0 0 1.92 1.93c1.7.46 7.66.46 7.66.46s5.96 0 7.66-.46a2.73 2.73 0 0 0 1.92-1.93A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.42-4.81zM10.1 14.9V9.1l5.02 2.9z" />
    </svg>
  );
}

function TikTokGlyph({ className, style }: GlyphProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.6 3h-2.7v12.3a2.6 2.6 0 1 1-2.2-2.57v-2.74a5.3 5.3 0 1 0 4.55 5.25V8.7a6.2 6.2 0 0 0 3.65 1.18V7.16A3.62 3.62 0 0 1 16.6 3z" />
    </svg>
  );
}

const SOURCE_META: Record<
  TerraceFeedSocial["source"],
  {
    name: string;
    accent: string;
    frame: string;
    Glyph: (props: GlyphProps) => React.JSX.Element;
    action: string;
  }
> = {
  instagram: {
    name: "Instagram",
    accent: "oklch(0.56 0.20 350)",
    frame: "linear-gradient(135deg, oklch(0.97 0.022 350), oklch(0.95 0.03 40))",
    Glyph: InstagramGlyph,
    action: "View on Instagram"
  },
  tiktok: {
    name: "TikTok",
    accent: "oklch(0.30 0.025 250)",
    frame: "linear-gradient(135deg, oklch(0.975 0.012 220), oklch(0.945 0.018 300))",
    Glyph: TikTokGlyph,
    action: "View on TikTok"
  },
  youtube: {
    name: "YouTube",
    accent: "oklch(0.55 0.21 27)",
    frame: "linear-gradient(135deg, oklch(0.975 0.018 30), oklch(0.935 0.038 28))",
    Glyph: YouTubeGlyph,
    action: "Watch on YouTube"
  }
};

const TYPE_LABEL: Record<string, string> = {
  video: "Video",
  short: "Short",
  reel: "Reel",
  image: "Photo",
  post: "Post"
};

function formatCount(n?: number) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}

function SocialEmbed({ social }: { social: TerraceFeedSocial }) {
  const meta = SOURCE_META[social.source];
  const Glyph = meta.Glyph;
  const isVideo = social.mediaType === "video" || social.mediaType === "short" || social.mediaType === "reel";
  const typeLabel = TYPE_LABEL[social.mediaType] ?? "Post";
  // Frame ratio matches each platform's native format — reads more credibly
  // than one-size-fits-all. Landscape video, vertical reel/short, square photo.
  const aspect = social.mediaType === "video" ? "16 / 9" : social.mediaType === "image" ? "1 / 1" : "4 / 5";
  const views = formatCount(social.stats.views);
  const likes = formatCount(social.stats.likes);
  const comments = formatCount(social.stats.comments);
  const stats = [views && `${views} views`, likes && `${likes} likes`, comments && `${comments} comments`].filter(
    Boolean
  ) as string[];

  return (
    <a
      href={social.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-3 block overflow-hidden rounded-2xl sm:mt-4"
    >
      <div
        className="relative overflow-hidden bg-cover bg-center"
        style={{
          background: social.thumbnailUrl ? undefined : meta.frame,
          backgroundImage: social.thumbnailUrl ? `url(${social.thumbnailUrl})` : undefined,
          aspectRatio: aspect
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.02)_42%,rgba(0,0,0,0.48))]" />
        {!social.thumbnailUrl ? (
          <Glyph
            className="pointer-events-none absolute -right-6 -bottom-8 h-44 w-44 opacity-[0.07]"
            style={{ color: meta.accent } as React.CSSProperties}
          />
        ) : null}

        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/88 px-2.5 py-1 text-[11px] font-semibold text-[#1d1d1f] shadow-[0_6px_18px_rgba(17,24,39,0.12)] backdrop-blur-sm">
          <Glyph className="h-3.5 w-3.5" style={{ color: meta.accent } as React.CSSProperties} />
          {typeLabel}
        </span>

        {isVideo ? (
          <span className="absolute top-1/2 left-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/95 shadow-[0_8px_24px_rgba(17,24,39,0.16)] transition duration-200 group-hover:scale-105">
            <span
              className="ml-1 h-0 w-0 border-y-[11px] border-l-[18px] border-y-transparent"
              style={{ borderLeftColor: meta.accent }}
            />
          </span>
        ) : (
          <span className="absolute top-1/2 left-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/95 shadow-[0_8px_24px_rgba(17,24,39,0.14)] transition duration-200 group-hover:scale-105">
            <Glyph className="h-6 w-6" style={{ color: meta.accent } as React.CSSProperties} />
          </span>
        )}

        {social.title ? (
          <div className="absolute right-4 bottom-4 left-4">
            <p className="line-clamp-2 text-lg leading-tight font-semibold tracking-[-0.035em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              {social.title}
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4 pt-2.5">
        <div className="min-w-0">
          {stats.length > 0 && <p className="truncate text-xs text-[#9b9a97]">{stats.join("  ·  ")}</p>}
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition group-hover:gap-1.5"
          style={{ color: meta.accent }}
        >
          {meta.action}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}

function LikeAction({ liked, onClick }: { liked: boolean; onClick: () => void }) {
  return (
    <button
      aria-label={liked ? "Liked" : "Like"}
      aria-pressed={liked}
      className="group/like relative grid h-9 w-9 place-items-center rounded-full transition-colors duration-150 hover:bg-[#faf0ea] active:scale-90"
      onClick={onClick}
      type="button"
    >
      {liked ? (
        <span
          aria-hidden
          className="creatorlink-ping pointer-events-none absolute inset-1 rounded-full ring-2 ring-[#f0a888]"
        />
      ) : null}
      <Heart
        className={cn(
          "h-[18px] w-[18px] transition-colors duration-150",
          liked ? "creatorlink-pop fill-[#e08550] text-[#e08550]" : "text-[#787774] group-hover/like:text-[#e08550]"
        )}
      />
    </button>
  );
}

function IconAction({
  active = false,
  activeClassName,
  fillWhenActive = false,
  icon: Icon,
  label,
  onClick
}: {
  active?: boolean;
  activeClassName: string;
  fillWhenActive?: boolean;
  icon: typeof Heart;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full transition-colors duration-150 active:scale-90",
        active ? activeClassName : "text-[#787774] hover:bg-[#f7f7f5] hover:text-[#37352f]"
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className={cn("h-[18px] w-[18px]", active && fillWhenActive && "fill-current")} />
    </button>
  );
}

export default TerraceFeedCard;
