import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobCreateForm } from "./job-create-form";

export default function NewJobPage() {
  return (
    <main className="terrace-app-bg mx-auto grid min-h-screen max-w-[1120px] gap-5 px-4 py-6 font-sans sm:gap-6 sm:px-5 sm:py-8">
      <div>
        <Link className="terrace-secondary-action h-9 px-3 text-sm sm:h-10" href="/jobs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Gigs
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <JobCreateForm />

        <aside className="grid content-start gap-5">
          <article className="rounded-[20px] border border-[#f3d5c4] bg-[#faf0ea] p-4 sm:p-5">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#D86B3D] uppercase">Brand portal</p>
            <h1 className="mt-3 font-serif text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              Create gigs creators can act on.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#7a513f]">
              This form talks to the real gig router. Brand owners, admins, and recruiters can publish open gigs or save
              drafts once their Clerk user is attached to a brand membership.
            </p>
          </article>

          <article className="rounded-xl border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">Next unlock</p>
            <p className="mt-3 text-sm leading-6 text-[#787774]">
              Next we can add a brand setup flow for teams that land here before creating their company profile.
            </p>
          </article>
        </aside>
      </section>
    </main>
  );
}
