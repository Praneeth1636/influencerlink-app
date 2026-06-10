import Link from "next/link";
import { Bookmark, BriefcaseBusiness, Search, Sparkles, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const savedItems = [
  {
    title: "Maya Chen",
    type: "Creator",
    meta: "Photography · Lifestyle · 840K reach",
    href: "/search",
    icon: UserRound
  },
  {
    title: "Autumn skincare launch",
    type: "Brief",
    meta: "Aera Studio · $2K-$4K · Beauty",
    href: "/jobs",
    icon: BriefcaseBusiness
  },
  {
    title: "Open-to-collab creators",
    type: "Search",
    meta: "Beauty, 100K+ reach, verified only",
    href: "/search?open=1&niche=Beauty&minReach=100000",
    icon: Search
  }
];

export default function SavedPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <header className="sticky top-0 z-40 border-b border-[#e9e9e7] bg-white/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[980px] items-center gap-4 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#9b9a97] uppercase">Saved</p>
            <p className="hidden text-sm text-[#787774] sm:block">Creators, briefs, and searches to revisit</p>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[980px] gap-6 px-5 py-7">
        <article className="rounded-[30px] border border-[#e9e9e7] bg-white p-6 shadow-[0_18px_54px_rgba(17,24,39,0.04)]">
          <Badge className="rounded-full border border-[#f3d5c4] bg-[#faf0ea] px-3 py-1 text-[#D86B3D] hover:bg-[#faf0ea]">
            <Bookmark className="mr-2 h-3.5 w-3.5" />
            Saved workspace
          </Badge>
          <h1 className="mt-5 max-w-2xl text-[clamp(32px,5vw,56px)] leading-[0.98] font-semibold tracking-[-0.06em]">
            Keep the best opportunities close.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#787774]">
            Saved items become the lightweight CRM for both creators and brands: favorite creators, briefs, searches,
            and collaboration leads.
          </p>
        </article>

        <div className="grid gap-3">
          {savedItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="grid gap-3 rounded-xl border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)] transition hover:-translate-y-0.5 hover:border-[#f3d5c4] md:grid-cols-[auto_1fr_auto]"
                href={item.href}
                key={item.title}
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#faf0ea] text-[#D86B3D]">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-semibold tracking-[0.18em] text-[#9b9a97] uppercase">
                    {item.type}
                  </span>
                  <strong className="mt-1 block text-xl font-semibold tracking-[-0.035em]">{item.title}</strong>
                  <span className="mt-1 block text-sm text-[#787774]">{item.meta}</span>
                </span>
                <span className="self-center rounded-full border border-[#e9e9e7] px-4 py-2 text-sm font-semibold text-[#787774]">
                  Open
                </span>
              </Link>
            );
          })}
        </div>

        <article className="rounded-xl border border-[#f3d5c4] bg-[#faf0ea] p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#D86B3D]" />
            <p className="font-semibold">Next MVP step</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#7a513f]">
            Saved creators and saved searches are ready in the product model. The next backend pass will persist this
            page against user-specific saves instead of this curated shell.
          </p>
        </article>
      </section>
    </main>
  );
}
