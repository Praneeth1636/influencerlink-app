import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobCreateForm } from "./job-create-form";

export default function NewJobPage() {
  return (
    <main className="mx-auto grid max-w-[1120px] gap-6 px-5 py-8">
      <div>
        <Link
          className="border-border text-muted-foreground hover:border-primary/35 hover:text-primary inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition"
          href="/jobs"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Jobs
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <JobCreateForm />

        <aside className="grid content-start gap-5">
          <article className="border-primary/25 bg-primary/10 rounded-2xl border p-5">
            <p className="text-primary text-[11px] font-black tracking-[0.2em] uppercase">Brand portal</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.05em]">Create briefs creators can act on.</h1>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              This form talks to the real job router. Brand owners, admins, and recruiters can publish open briefs or
              save drafts once their Clerk user is attached to a brand membership.
            </p>
          </article>

          <article className="border-border bg-card rounded-xl border p-5">
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">Next unlock</p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Next we can add a brand setup flow for teams that land here before creating their company profile.
            </p>
          </article>
        </aside>
      </section>
    </main>
  );
}
