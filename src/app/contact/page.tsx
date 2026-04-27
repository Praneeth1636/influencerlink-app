"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { Scales } from "@/components/ui/scales";
import { LogoSparkles } from "@/components/ui/sparkles";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        company: formData.get("company"),
        message: formData.get("message")
      })
    });

    setIsSubmitting(false);
    setStatus(response.ok ? "Message saved. Our team will reach out." : "Could not send message. Please check the fields.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-[#171717] p-2 text-white">
      <section className="min-h-[calc(100vh-16px)] rounded-2xl bg-[#060606] px-6 py-12 md:px-16 lg:px-28">
        <div className="mx-auto grid min-h-[calc(100vh-112px)] max-w-[1580px] items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="grid gap-10">
            <Link className="logoMark authLogo" href="/login" aria-label="InfluencerLink">
              <span />
              <span />
              <span />
            </Link>
            <LogoSparkles className="-mt-8 h-14" />

            <div className="grid gap-7">
              <div className="flex h-[76px] w-[76px] items-center justify-center rounded-lg bg-[#242424] shadow-[0_0_0_6px_rgba(255,255,255,0.03)]">
                <Mail className="h-8 w-8 text-[#2d73ff]" />
              </div>
              <h1 className="text-[52px] font-bold tracking-[-0.04em] md:text-[68px]">Contact us</h1>
              <p className="max-w-[690px] text-[22px] leading-[1.45] text-[#a8a8a8] md:text-[25px]">
                We are always looking for ways to improve our creator marketplace. Contact us and let us know how we can help you.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-lg text-[#a8a8a8] md:text-xl">
              <span>contact@influencerlink.ai</span>
              <span>•</span>
              <span>+1 (800) 123 LINK</span>
              <span>•</span>
              <span>support@influencerlink.ai</span>
            </div>

            <div className="contactMap" aria-hidden="true">
              <div className="mapPulse" />
              <div className="mapTag">We are here</div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(110deg,rgba(28,28,28,0.98),rgba(8,8,8,0.98))] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.38)] md:p-14">
            <DottedGlowBackground className="opacity-20" gap={12} radius={1.1} />
            <Scales orientation="vertical" className="opacity-20" />
            <div className="contactGrid" aria-hidden="true" />
            <form className="relative z-[1] grid gap-9" onSubmit={submitContact}>
              <div className="grid gap-3">
                <Label className="text-xl font-semibold text-[#e4e4e4]" htmlFor="contact-name">
                  Full name
                </Label>
                <Input
                  className="h-[56px] rounded-lg border-[#2f2f2f] bg-[#292929] px-5 text-xl text-white placeholder:text-[#7f7f7f]"
                  id="contact-name"
                  name="fullName"
                  placeholder="Sara Rivera"
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-xl font-semibold text-[#e4e4e4]" htmlFor="contact-email">
                  Email Address
                </Label>
                <Input
                  className="h-[56px] rounded-lg border-[#2f2f2f] bg-[#292929] px-5 text-xl text-white placeholder:text-[#7f7f7f]"
                  id="contact-email"
                  name="email"
                  placeholder="support@brand.com"
                  type="email"
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-xl font-semibold text-[#e4e4e4]" htmlFor="contact-company">
                  Company
                </Label>
                <Input
                  className="h-[56px] rounded-lg border-[#2f2f2f] bg-[#292929] px-5 text-xl text-white placeholder:text-[#7f7f7f]"
                  id="contact-company"
                  name="company"
                  placeholder="Acme Beauty LLC"
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-xl font-semibold text-[#e4e4e4]" htmlFor="contact-message">
                  Message
                </Label>
                <textarea
                  className="min-h-[156px] rounded-lg border border-[#2f2f2f] bg-[#292929] px-5 py-5 text-xl text-white placeholder:text-[#7f7f7f] focus:outline-none focus:ring-2 focus:ring-[#2d73ff]"
                  id="contact-message"
                  name="message"
                  placeholder="Type your message here"
                />
              </div>

              {status && <p className="rounded-lg bg-white/5 px-4 py-3 text-base text-[#d6d6d6]">{status}</p>}

              <Button className="h-[50px] w-fit rounded-lg bg-[#2b2b2b] px-6 text-xl font-semibold text-white hover:bg-[#343434]" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
