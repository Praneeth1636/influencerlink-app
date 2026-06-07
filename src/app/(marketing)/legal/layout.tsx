import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 font-sans text-[#37352f] sm:py-16">
      <nav className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-[#787774]">
        <Link className="transition hover:text-[#37352f]" href="/legal/terms">
          Terms
        </Link>
        <Link className="transition hover:text-[#37352f]" href="/legal/privacy">
          Privacy
        </Link>
        <Link className="transition hover:text-[#37352f]" href="/legal/aup">
          Acceptable Use
        </Link>
      </nav>
      <article className="prose prose-neutral prose-headings:tracking-[-0.04em] prose-headings:text-[#37352f] prose-p:text-[#3d4250] prose-p:leading-7 prose-li:text-[#3d4250] prose-a:text-[#37352f] max-w-none">
        {children}
      </article>
      <p className="mt-12 rounded-2xl border border-[#f1d4bd] bg-[#fff7f0] p-4 text-xs leading-5 text-[#7c4a2a]">
        <strong>Placeholder document.</strong> This is template text generated to fill the route. Before launching to
        real users, replace it with legal text reviewed by counsel (or generated via Termly / Iubenda and adapted to
        your jurisdiction).
      </p>
    </main>
  );
}
