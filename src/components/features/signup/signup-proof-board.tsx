"use client";

import { useCallback, useEffect, useState } from "react";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";

const PROOF_MESSAGES = [
  "CREATOR WON\n2.1M REACH\nGLOSSIER LAUNCH",
  "BRAND SEARCH\nBEAUTY · LA\nUNDER $3K",
  "OPEN TO COLLABS\n7H MEDIAN\nREPLY TIME",
  "AI MATCH FOUND\n94% AUDIENCE\nFIT SCORE",
  "NEW DROP LIVE\n8.4% VERIFIED\nENGAGEMENT"
];

export function SignupProofBoard() {
  const [messageIndex, setMessageIndex] = useState(0);

  const nextMessage = useCallback(() => {
    setMessageIndex((currentIndex) => (currentIndex + 1) % PROOF_MESSAGES.length);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(nextMessage, 5200);

    return () => window.clearInterval(intervalId);
  }, [nextMessage]);

  return (
    <section className="creatorlink-animate-in creatorlink-delay-2 relative z-10 mx-auto grid w-full max-w-6xl gap-6 rounded-[30px] border border-[#e9e9e7] bg-white/82 p-5 shadow-[0_24px_64px_rgba(17,24,39,0.07)] backdrop-blur-xl lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:p-7">
      <div className="px-1 lg:px-2">
        <p className="text-sm font-semibold tracking-[0.16em] text-[#e08550] uppercase">Live proof board</p>
        <h2 className="mt-3 max-w-xl text-[clamp(34px,5vw,62px)] leading-[0.98] font-semibold tracking-[-0.065em]">
          A profile should move like the creator economy.
        </h2>
        <p className="mt-5 max-w-lg text-base leading-7 text-[#787774]">
          This is where creator wins, brand searches, and AI matches can feel alive without turning the page loud.
        </p>
      </div>

      <div className="rounded-[28px] bg-[#f7fafc] p-3">
        <TextFlippingBoard key={PROOF_MESSAGES[messageIndex]} text={PROOF_MESSAGES[messageIndex]} />
      </div>
    </section>
  );
}
