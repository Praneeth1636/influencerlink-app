"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);
    setIsSubmitting(false);
    setStatus("Message saved. Our team will reach out.");
    event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:py-24">
        <div className="grid content-start gap-8">
          <Link className="logoMark authLogo bg-[#37352f]" href="/" aria-label="Terrace">
            <span />
            <span />
            <span />
          </Link>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#e08550] uppercase">Contact</p>
            <h1 className="mt-4 max-w-xl text-[clamp(44px,8vw,92px)] leading-[0.92] font-semibold tracking-[-0.08em]">
              Tell us what you are building.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#787774]">
              Questions, partnerships, early brand access, creator feedback, or investor notes. We read everything.
            </p>
          </div>

          <div className="grid gap-3">
            <ContactLine icon={Mail} label="contact@terrace.so" />
            <ContactLine icon={MessageCircle} label="support@terrace.so" />
            <ContactLine icon={MapPin} label="Built for global creator teams" />
          </div>
        </div>

        <section className="rounded-[34px] border border-[#e9e9e7] bg-white p-4 shadow-[0_28px_80px_rgba(17,24,39,0.07)]">
          <form
            className="grid gap-5 rounded-[28px] border border-[#e9e9e7] bg-[#fbfbfa] p-5 sm:p-7"
            onSubmit={submitContact}
          >
            <div className="grid gap-2">
              <Label className="text-sm font-semibold text-[#263142]" htmlFor="contact-name">
                Full name
              </Label>
              <Input
                className="h-12 rounded-2xl border-[#d8dee8] bg-white px-5 text-base text-[#37352f] placeholder:text-[#8a94a5] focus-visible:ring-[#8CC9E8]/30"
                id="contact-name"
                name="fullName"
                placeholder="Sara Rivera"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold text-[#263142]" htmlFor="contact-email">
                Email address
              </Label>
              <Input
                className="h-12 rounded-2xl border-[#d8dee8] bg-white px-5 text-base text-[#37352f] placeholder:text-[#8a94a5] focus-visible:ring-[#8CC9E8]/30"
                id="contact-email"
                name="email"
                placeholder="you@brand.com"
                type="email"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold text-[#263142]" htmlFor="contact-company">
                Company
              </Label>
              <Input
                className="h-12 rounded-2xl border-[#d8dee8] bg-white px-5 text-base text-[#37352f] placeholder:text-[#8a94a5] focus-visible:ring-[#8CC9E8]/30"
                id="contact-company"
                name="company"
                placeholder="Aera Studio"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-semibold text-[#263142]" htmlFor="contact-message">
                Message
              </Label>
              <textarea
                className="min-h-[170px] rounded-2xl border border-[#d8dee8] bg-white px-5 py-4 text-base text-[#37352f] placeholder:text-[#8a94a5] focus:ring-4 focus:ring-[#8CC9E8]/25 focus:outline-none"
                id="contact-message"
                name="message"
                placeholder="Tell us how we can help."
              />
            </div>

            {status && (
              <p className="rounded-2xl border border-[#d7eddc] bg-[#effaf3] px-4 py-3 text-sm font-medium text-[#287944]">
                {status}
              </p>
            )}

            <Button
              className="h-12 w-fit rounded-full bg-[#37352f] px-6 text-sm font-semibold text-white hover:bg-[#1d222b]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </section>
      </section>
    </main>
  );
}

function ContactLine({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-[#e9e9e7] bg-white px-4 py-3 shadow-sm">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#edf8ff] text-[#2f83b7]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold text-[#4b5563]">{label}</span>
    </div>
  );
}
