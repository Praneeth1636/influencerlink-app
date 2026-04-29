import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobCreateForm } from "./job-create-form";

export default function NewJobPage() {
  return (
    <main className="mx-auto grid max-w-[1120px] gap-6 px-5 py-8">
      <div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
          href="/jobs"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Jobs
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <JobCreateForm />

        <aside className="grid content-start gap-5">
          <article className="rounded-2xl border border-[#D85A30]/25 bg-[#D85A30]/10 p-5">
            <p className="text-[11px] font-black tracking-[0.2em] text-[#ffb49c] uppercase">Brand portal</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.05em]">Create briefs creators can act on.</h1>
            <p className="mt-3 text-sm leading-6 text-white/58">
              This form talks to the real job router. Brand owners, admins, and recruiters can publish open briefs or
              save drafts once their Clerk user is attached to a brand membership.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Next unlock</p>
            <p className="mt-3 text-sm leading-6 text-white/58">
              The manual brand ID field will become an organization picker when the full brand team dashboard lands.
            </p>
          </article>
        </aside>
      </section>
    </main>
  );
}
