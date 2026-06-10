import Link from "next/link";
import { BarChart3, Eye, MessageSquare, Radio, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const analytics = [
  { label: "Profile views", value: "12.8K", change: "+18%", icon: Eye },
  { label: "Content reach", value: "4.3M", change: "+24%", icon: Users },
  { label: "Avg engagement", value: "7.0%", change: "+1.2%", icon: TrendingUp },
  { label: "Brand replies", value: "42", change: "+9", icon: MessageSquare }
];

const posts = [
  { title: "Skincare routine launch proof", reach: "2.1M", engagement: "8.4%", status: "Top proof" },
  { title: "Morning light content drop", reach: "840K", engagement: "7.8%", status: "Saved by 18 brands" },
  { title: "Open to collabs signal", reach: "310K", engagement: "6.2%", status: "3 inbound briefs" }
];

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <header className="sticky top-0 z-40 border-b border-[#e9e9e7] bg-white/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#9b9a97] uppercase">Analytics</p>
            <p className="hidden text-sm text-[#787774] sm:block">Proof performance and brand intent</p>
          </div>
          <Link
            className="ml-auto rounded-full bg-[#37352f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#262420]"
            href="/settings/billing"
          >
            Upgrade analytics
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1180px] gap-6 px-5 py-7">
        <article className="rounded-[30px] border border-[#e9e9e7] bg-white p-6 shadow-[0_18px_54px_rgba(17,24,39,0.04)]">
          <Badge className="rounded-full border border-[#f3d5c4] bg-[#faf0ea] px-3 py-1 text-[#D86B3D] hover:bg-[#faf0ea]">
            <Radio className="mr-2 h-3.5 w-3.5" />
            Creator proof dashboard
          </Badge>
          <h1 className="mt-5 max-w-3xl font-serif text-[clamp(32px,5vw,58px)] leading-[0.98] font-semibold tracking-[-0.03em]">
            Understand which proof turns into brand demand.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#787774]">
            This MVP view tracks the metrics creators and brand teams both care about: reach, engagement, saves,
            replies, and profile intent.
          </p>
        </article>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {analytics.map((item) => {
            const Icon = item.icon;
            return (
              <article
                className="rounded-[24px] border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]"
                key={item.label}
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#faf0ea] text-[#D86B3D]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-[#bfe8d0] bg-[#e8f8ef] px-3 py-1 text-xs font-semibold text-[#147a3b]">
                    {item.change}
                  </span>
                </div>
                <p className="mt-5 text-[11px] font-semibold tracking-[0.18em] text-[#9b9a97] uppercase">
                  {item.label}
                </p>
                <strong className="mt-1 block text-3xl font-semibold tracking-[-0.05em]">{item.value}</strong>
              </article>
            );
          })}
        </div>

        <article className="rounded-[26px] border border-[#e9e9e7] bg-white p-5 shadow-[0_14px_40px_rgba(17,24,39,0.035)]">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-[#D86B3D]" />
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Best performing proof</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {posts.map((post) => (
              <div
                className="grid gap-3 rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] p-4 md:grid-cols-[1fr_auto_auto_auto]"
                key={post.title}
              >
                <p className="font-semibold">{post.title}</p>
                <span className="text-sm text-[#787774]">{post.reach} reach</span>
                <span className="text-sm text-[#787774]">{post.engagement} eng</span>
                <span className="text-sm font-semibold text-[#D86B3D]">{post.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
